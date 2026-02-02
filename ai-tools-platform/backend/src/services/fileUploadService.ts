import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/index.js'

export interface UploadedFile {
  id?: number
  fileId: string
  conversationId: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  fileType: 'image' | 'document' | 'text'
  storageType: string
  metadata?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

export interface FileUploadResult {
  success: boolean
  data?: UploadedFile
  error?: string
}

export class FileUploadService {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), '../uploads')
    this.ensureUploadDir()
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
      console.log('✅ Upload directory created:', this.uploadDir)
    }
  }

  private getFileType(mimeType: string): 'image' | 'document' | 'text' {
    if (mimeType.startsWith('image/')) {
      return 'image'
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text')
    ) {
      return 'document'
    } else {
      return 'text'
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    conversationId: string,
    metadata?: Record<string, any>
  ): Promise<FileUploadResult> {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided'
        }
      }

      // 验证文件大小 (最大 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size exceeds 10MB limit'
        }
      }

      // 生成唯一文件名
      const fileId = uuidv4()
      const fileExtension = path.extname(file.originalname)
      const uniqueFileName = `${fileId}${fileExtension}`
      const filePath = path.join(this.uploadDir, uniqueFileName)

      // 保存文件到磁盘
      await fs.writeFile(filePath, file.buffer)

      // 确定文件类型
      const fileType = this.getFileType(file.mimetype)

      // 保存文件信息到数据库
      const fileRecord: Omit<UploadedFile, 'id' | 'createdAt' | 'updatedAt'> = {
        fileId,
        conversationId,
        originalName: file.originalname,
        filePath: uniqueFileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileType,
        storageType: 'local',
        metadata: metadata || {}
      }

      const savedFile = await this.saveFileRecord(fileRecord)

      console.log('✅ File uploaded successfully:', {
        fileId,
        originalName: file.originalname,
        size: file.size,
        type: fileType
      })

      return {
        success: true,
        data: savedFile
      }
    } catch (error: any) {
      console.error('❌ File upload failed:', error)
      return {
        success: false,
        error: error.message || 'File upload failed'
      }
    }
  }

  private async saveFileRecord(file: Omit<UploadedFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UploadedFile> {
    const query = `
      INSERT INTO uploaded_files 
      (file_id, conversation_id, original_name, file_path, file_size, mime_type, file_type, storage_type, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at as "createdAt", updated_at as "updatedAt"
    `

    const values = [
      file.fileId,
      file.conversationId,
      file.originalName,
      file.filePath,
      file.fileSize,
      file.mimeType,
      file.fileType,
      file.storageType,
      file.metadata ? JSON.stringify(file.metadata) : null
    ]

    const result = await db.query(query, values)
    return {
      ...file,
      id: result.rows[0].id,
      createdAt: result.rows[0].createdAt,
      updatedAt: result.rows[0].updatedAt
    }
  }

  async getFilesByConversation(conversationId: string): Promise<UploadedFile[]> {
    const query = `
      SELECT 
        id,
        file_id as "fileId",
        conversation_id as "conversationId",
        original_name as "originalName",
        file_path as "filePath",
        file_size as "fileSize",
        mime_type as "mimeType",
        file_type as "fileType",
        storage_type as "storageType",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM uploaded_files
      WHERE conversation_id = $1
      ORDER BY created_at DESC
    `

    const result = await db.query(query, [conversationId])
    return result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }))
  }

  async getFile(fileId: string): Promise<UploadedFile | null> {
    const query = `
      SELECT 
        id,
        file_id as "fileId",
        conversation_id as "conversationId",
        original_name as "originalName",
        file_path as "filePath",
        file_size as "fileSize",
        mime_type as "mimeType",
        file_type as "fileType",
        storage_type as "storageType",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM uploaded_files
      WHERE file_id = $1
    `

    const result = await db.query(query, [fileId])
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : undefined
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // 先获取文件信息
      const file = await this.getFile(fileId)
      if (!file) {
        return false
      }

      // 删除磁盘文件
      const fullPath = path.join(this.uploadDir, file.filePath)
      await fs.unlink(fullPath)

      // 删除数据库记录
      const query = `DELETE FROM uploaded_files WHERE file_id = $1`
      const result = await db.query(query, [fileId])

      console.log('✅ File deleted successfully:', fileId)
      return result.rowCount ? result.rowCount > 0 : false
    } catch (error) {
      console.error('❌ File deletion failed:', error)
      return false
    }
  }

  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const query = `
        SELECT file_id, file_path 
        FROM uploaded_files 
        WHERE created_at < CURRENT_DATE - INTERVAL '${daysOld} days'
      `
      const result = await db.query(query)

      let deletedCount = 0
      for (const row of result.rows) {
        const deleted = await this.deleteFile(row.file_id)
        if (deleted) deletedCount++
      }

      console.log(`✅ Cleaned up ${deletedCount} old files`)
      return deletedCount
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
      return 0
    }
  }
}

export const fileUploadService = new FileUploadService()

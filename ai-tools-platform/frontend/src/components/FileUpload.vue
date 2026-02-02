http://localhost:5001/api/tools
<template>
  <div class="file-upload">
    <el-upload class="upload-area" drag :action="uploadUrl" :headers="uploadHeaders" :data="uploadData"
      :before-upload="beforeUpload" :on-success="handleSuccess" :on-error="handleError" :on-remove="handleRemove"
      :file-list="fileList" accept="image/*,.pdf,.doc,.docx,.txt,.md" multiple :limit="5">
      <el-icon class="upload-icon">
        <UploadFilled />
      </el-icon>
      <div class="upload-text">
        <div class="upload-main">拖拽文件到此处或点击上传</div>
        <div class="upload-hint">支持图片、PDF、文档、文本文件（最多5个，每个10MB）</div>
      </div>
    </el-upload>

    <!-- 文件预览 -->
    <div v-if="uploadedFiles.length > 0" class="file-preview">
      <div v-for="file in uploadedFiles" :key="file.fileId" class="file-item">
        <div class="file-thumbnail">
          <img v-if="file.fileType === 'image'" :src="getFileUrl(file.filePath)" alt="预览" />
          <div v-else class="file-icon">
            <el-icon>
              <Document />
            </el-icon>
          </div>
        </div>
        <div class="file-info">
          <div class="file-name" :title="file.originalName">{{ file.originalName }}</div>
          <div class="file-size">{{ formatFileSize(file.fileSize) }}</div>
        </div>
        <div class="file-actions">
          <el-button type="text" size="small" @click="removeFile(file.fileId)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled, Document, Delete } from '@element-plus/icons-vue'
  import type { UploadProps, UploadFile } from 'element-plus'

  interface UploadedFile {
    fileId: string
    originalName: string
    filePath: string
    fileSize: number
    mimeType: string
    fileType: 'image' | 'document' | 'text'
  }

  const props = defineProps < {
    conversationId: string
  apiBaseUrl: string
  } > ()

  const emit = defineEmits < {
    fileUploaded: [file: UploadedFile]
  fileRemoved: [fileId: string]
  } > ()

  const fileList = ref < UploadFile[] > ([])
  const uploadedFiles = ref < UploadedFile[] > ([])

  const uploadUrl = computed(() => `${props.apiBaseUrl}/tools/conversations/${props.conversationId}/upload`)

  const uploadHeaders = computed(() => {
    // 可以添加认证头
    return {}
  })

  const uploadData = computed(() => ({
    conversationId: props.conversationId
  }))

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过 10MB')
      return false
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown'
    ]

    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      ElMessage.error('不支持的文件类型')
      return false
    }

    return true
  }

  const handleSuccess: UploadProps['onSuccess'] = (response: any, uploadFile: UploadFile) => {
    if (response.success) {
      const fileData: UploadedFile = response.data
      uploadedFiles.value.push(fileData)
      emit('fileUploaded', fileData)
      ElMessage.success('文件上传成功')
    } else {
      handleError(response.error, uploadFile)
    }
  }

  const handleError: UploadProps['onError'] = (error: Error, uploadFile: UploadFile) => {
    console.error('文件上传失败:', error)
    ElMessage.error(`文件上传失败: ${uploadFile.name}`)
  }

  const handleRemove: UploadProps['onRemove'] = (uploadFile: UploadFile) => {
    // 这里可以根据需要删除已上传的文件
    const file = uploadedFiles.value.find(f => f.originalName === uploadFile.name)
    if (file) {
      removeFile(file.fileId)
    }
  }

  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`${props.apiBaseUrl}/tools/files/${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        uploadedFiles.value = uploadedFiles.value.filter(f => f.fileId !== fileId)
        fileList.value = fileList.value.filter(f => {
          const uploadedFile = uploadedFiles.value.find(uf => uf.fileId === fileId)
          return uploadedFile ? f.name !== uploadedFile.originalName : true
        })
        emit('fileRemoved', fileId)
        ElMessage.success('文件删除成功')
      } else {
        ElMessage.error('文件删除失败: ' + result.error)
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      ElMessage.error('文件删除失败')
    }
  }

  const getFileUrl = (filePath: string) => {
    // 构建完整的文件URL
    const baseUrl = '' // 使用相对路径，让浏览器自动处理
    return `${baseUrl}/api/tools/files/${filePath}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const loadFiles = async () => {
    try {
      const response = await fetch(`${props.apiBaseUrl}/tools/conversations/${props.conversationId}/files`)
      const result = await response.json()

      if (result.success) {
        uploadedFiles.value = result.data
      }
    } catch (error) {
      console.error('加载文件列表失败:', error)
    }
  }

  // 暴露方法给父组件
  defineExpose({
    loadFiles
  })

  // 当 conversationId 变化时加载文件
  watch(() => props.conversationId, (newId) => {
    if (newId) {
      loadFiles()
    }
  }, { immediate: true })
</script>

<style scoped>
  .file-upload {
    width: 100%;
  }

  .upload-area {
    width: 100%;
  }

  .upload-area :deep(.el-upload-dragger) {
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #dcdfe6;
    transition: all 0.3s;
  }

  .upload-area :deep(.el-upload-dragger:hover) {
    border-color: #409eff;
    background-color: #f5f7fa;
  }

  .upload-icon {
    font-size: 48px;
    color: #909399;
    margin-bottom: 10px;
  }

  .upload-text {
    text-align: center;
  }

  .upload-main {
    font-size: 16px;
    color: #606266;
    margin-bottom: 5px;
  }

  .upload-hint {
    font-size: 12px;
    color: #909399;
  }

  .file-preview {
    margin-top: 15px;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    margin-bottom: 8px;
    background-color: #f5f7fa;
  }

  .file-thumbnail {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
  }

  .file-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .file-icon {
    font-size: 24px;
    color: #909399;
  }

  .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 13px;
    color: #303133;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: 11px;
    color: #909399;
  }

  .file-actions {
    margin-left: 10px;
  }
</style>
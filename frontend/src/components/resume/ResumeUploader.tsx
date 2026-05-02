'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import { clsx } from 'clsx'

interface ResumeUploaderProps {
  onUpload: (file: File) => void
  isLoading?: boolean
}

export function ResumeUploader({ onUpload, isLoading }: ResumeUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) onUpload(acceptedFiles[0])
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'card p-6 cursor-pointer border-dashed text-center transition-all duration-200',
        isDragActive ? 'border-brand-500 bg-brand-500/5' : 'hover:border-slate-600',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
          isDragActive ? 'bg-brand-500/20' : 'bg-surface-hover'
        )}>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          ) : isDragActive ? (
            <FileText className="w-5 h-5 text-brand-400" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            {isLoading ? 'Uploading...' : isDragActive ? 'Drop it here' : 'Drop your resume'}
          </p>
          <p className="text-xs text-slate-500 mt-1">PDF or DOCX · Max 10MB</p>
        </div>
      </div>
    </div>
  )
}

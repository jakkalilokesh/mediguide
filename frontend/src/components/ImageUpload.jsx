import { useState, useRef } from 'react'
import { Camera, Upload, X, Image as ImageIcon, Loader } from 'lucide-react'

export default function ImageUpload({ onImageSelect, disabled }) {
    const [preview, setPreview] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileRef = useRef(null)

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be under 10MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target.result
            setPreview(base64)
            onImageSelect(base64)
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        processFile(file)
    }

    const handleChange = (e) => {
        const file = e.target.files[0]
        processFile(file)
    }

    const clearImage = () => {
        setPreview(null)
        onImageSelect(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    return (
        <div className="image-upload-wrapper">
            {!preview ? (
                <div
                    className={`image-dropzone ${dragActive ? 'active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                >
                    <Camera size={28} />
                    <p>Drop an image here or click to upload</p>
                    <small>Supports JPG, PNG, WEBP (max 10MB)</small>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                        capture="environment"
                    />
                </div>
            ) : (
                <div className="image-preview-wrapper">
                    <img src={preview} alt="Symptom" className="image-preview" />
                    <button className="image-clear-btn" onClick={clearImage}><X size={16} /></button>
                </div>
            )}
        </div>
    )
}

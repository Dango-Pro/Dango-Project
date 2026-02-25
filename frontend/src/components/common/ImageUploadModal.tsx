import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { api } from '../../libs/api';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (newUrl: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    // const { t } = useTranslation(); 
    const [mode, setMode] = useState<'select' | 'crop'>('select');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Default avatars (DiceBear or similar)
    const defaultAvatars = Array.from({ length: 20 }, (_, i) => 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    );

    useEffect(() => {
        if (isOpen) {
            setMode('select');
            setImageSrc(null);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
            setMode('crop');
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                   reject(new Error('Canvas is empty'));
                   return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setLoading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const formData = new FormData();
            formData.append('file', croppedImageBlob, 'profile.jpg');

            const res = await api.post('/users/me/profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUploadSuccess(res.data.profileImageUrl);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAvatar = async (url: string) => {
        setLoading(true);
        try {
            // Use PATCH /users/me to update profileImageUrl directly
            // UserUpdateRequest needs to be updated in backend to support this, or we created a separated endpoint.
            // Assuming I added profileImageUrl to UserUpdateRequest
            await api.patch('/users/me', { profileImageUrl: url });
            onUploadSuccess(url);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to set avatar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: mode === 'crop' ? '500px' : '600px', maxWidth: '90%' }}>
                <h3 className="modal-title">프로필 사진 설정</h3>
                
                {mode === 'select' ? (
                    <div>
                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} id="file-upload" />
                            <label htmlFor="file-upload" className="primary-btn" style={{ cursor: 'pointer', display: 'inline-block', width: '100%', padding: '12px' }}>
                                📁 내 컴퓨터에서 사진 선택
                            </label>
                        </div>
                        
                        <h4 style={{ fontSize: '1rem', marginBottom: '10px', color: '#666' }}>기본 캐릭터 선택</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                            {defaultAvatars.map((url, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSelectAvatar(url)}
                                    style={{ 
                                        aspectRatio: '1', 
                                        borderRadius: '50%', 
                                        overflow: 'hidden', 
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s',
                                        background: '#f0f0f0'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <img src={url} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ height: '300px', position: 'relative', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                            <Cropper
                                image={imageSrc!}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div style={{ padding: '10px 0' }}>
                            <label>Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="secondary-btn" onClick={() => setMode('select')} disabled={loading}>뒤로</button>
                            <button className="primary-btn" onClick={handleUpload} disabled={loading}>
                                {loading ? '업로드 중...' : '저장'}
                            </button>
                        </div>
                    </>
                )}

                {mode === 'select' && (
                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button className="secondary-btn" onClick={onClose}>취소</button>
                    </div>
                )}
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .modal-title {
                    margin-top: 0;
                    margin-bottom: 16px;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
};

export default ImageUploadModal;

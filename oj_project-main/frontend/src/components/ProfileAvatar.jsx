import React, { useRef } from 'react';

const ProfileAvatar = ({ 
    src, 
    alt, 
    size = 'md', 
    fallback = 'U', 
    editable = false, 
    onAvatarChange 
}) => {
    const fileInputRef = useRef(null);

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-24 h-24 text-2xl',
        xl: 'w-32 h-32 text-3xl'
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                window.showToast && window.showToast('Please select an image file', 'warning');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                window.showToast && window.showToast('File size must be less than 5MB', 'warning');
                return;
            }

            onAvatarChange && onAvatarChange(file);
        }
    };

    const handleClick = () => {
        if (editable && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="relative inline-block">
            <div 
                className={`${sizeClasses[size]} bg-white-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden border-2 border-dotted border-black ${
                    editable ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''
                }`}
                onClick={handleClick}
            >
                {src ? (
                    <img 
                        src={src} 
                        alt={alt || 'Avatar'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : (
                    <span>{fallback}</span>
                )}
                
                {/* Fallback for broken images */}
                {src && (
                    <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: 'none' }}
                    >
                        <span>{fallback}</span>
                    </div>
                )}
            </div>

            {/* Edit overlay */}
            {editable && (
                <>
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleClick}
                    >
                        <svg 
                            className="w-6 h-6 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                            />
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                        </svg>
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
};

export default ProfileAvatar;

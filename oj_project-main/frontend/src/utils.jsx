import {toast} from 'react-toastify';
export function handleSuccess(message) {
    toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#333',
            color: '#fff',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '8px',
            zIndex: 10000,
        },
    });
}
export function handleError(message) {
    toast.error(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#f44336',
            color: '#fff',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '8px',
            zIndex: 10000,
        },
    });
}
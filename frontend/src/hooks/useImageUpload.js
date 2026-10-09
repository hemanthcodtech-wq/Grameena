import { useState } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('image', file);
      const res = await axios.post(`${API}/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.url;
    } catch {
      alert('Image upload failed. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};

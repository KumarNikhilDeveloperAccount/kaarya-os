export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const saveProfileData = (role: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`kaarya_profile_${role}`, JSON.stringify(data));
    // Also save the active role so the profile page knows what to load
    localStorage.setItem('kaarya_active_role', role);
  }
};

export const getProfileData = (role: string) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`kaarya_profile_${role}`);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const getActiveRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kaarya_active_role') || 'candidate';
  }
  return 'candidate';
};

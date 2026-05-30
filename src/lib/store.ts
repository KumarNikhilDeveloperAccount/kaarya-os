export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% JPEG
      };
      img.onerror = error => reject(error);
    };
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

// --- Job Engine ---
export const saveJob = (job: any) => {
  if (typeof window !== 'undefined') {
    const existing = getJobs();
    const newJob = { ...job, id: Date.now().toString(), created_at: new Date().toISOString() };
    localStorage.setItem('kaarya_jobs', JSON.stringify([newJob, ...existing]));
    return newJob;
  }
  return null;
};

export const getJobs = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('kaarya_jobs');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const applyToJob = (jobId: string, candidateData: any) => {
  if (typeof window !== 'undefined') {
    const apps = getApplications();
    const newApp = { jobId, candidate: candidateData, applied_at: new Date().toISOString() };
    localStorage.setItem('kaarya_applications', JSON.stringify([...apps, newApp]));
  }
};

export const getApplications = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('kaarya_applications');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const hasAppliedToJob = (jobId: string, candidateName: string) => {
  const apps = getApplications();
  return apps.some((app: any) => app.jobId === jobId && app.candidate?.fullName === candidateName);
};

// --- Account Management ---
export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kaarya_profile_candidate');
    localStorage.removeItem('kaarya_profile_company');
    localStorage.removeItem('kaarya_profile_trainer');
    localStorage.removeItem('kaarya_profile_college');
    localStorage.removeItem('kaarya_active_role');
    localStorage.removeItem('kaarya_jobs');
    localStorage.removeItem('kaarya_applications');
  }
};

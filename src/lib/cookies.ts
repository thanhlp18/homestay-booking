export const cookieUtils = {
  set: (name: string, value: string, options: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}) => {
    const {
      maxAge = 3600,
      path = '/',
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'Strict'
    } = options;

    let cookie = `${name}=${encodeURIComponent(value)}; path=${path}`;
    
    if (maxAge) {
      cookie += `; max-age=${maxAge}`;
    }
    
    if (secure) {
      cookie += '; secure';
    }
    
    if (sameSite) {
      cookie += `; SameSite=${sameSite}`;
    }

    document.cookie = cookie;
  },

  get: (name: string): string | null => {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    
    if (cookie) {
      try {
        return decodeURIComponent(cookie.split('=')[1]);
      } catch {
        return null;
      }
    }
    return null;
  },

  remove: (name: string, path: string = '/') => {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
  }
}; 
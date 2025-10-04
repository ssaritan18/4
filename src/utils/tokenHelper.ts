export function getStoredToken(): string | null {
  const TOKEN_KEY = "adhders_token_v1";
  
  // Try localStorage first
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log("🔑 Token fetched from localStorage:", token.substring(0, 20) + "...");
      return token;
    }
  } catch (err) {
    console.warn("⚠️ localStorage access failed:", err);
  }
  
  // Try sessionStorage fallback
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log("🔑 Token fetched from sessionStorage:", token.substring(0, 20) + "...");
      return token;
    }
  } catch (err) {
    console.warn("⚠️ sessionStorage access failed:", err);
  }
  
  // Try cookie fallback
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith(`${TOKEN_KEY}=`));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log("🔑 Token fetched from cookie:", token.substring(0, 20) + "...");
      return token;
    }
  } catch (err) {
    console.warn("⚠️ cookie access failed:", err);
  }
  
  console.warn("⚠️ No token found in any storage method");
  return null;
}

export function hasValidToken(): boolean {
  const token = getStoredToken();
  return !!token;
}

export function setStoredToken(token: string): void {
  const TOKEN_KEY = "adhders_token_v1";
  
  // Try localStorage first
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log("💾 Token saved to localStorage");
  } catch (err) {
    console.warn("⚠️ localStorage save failed:", err);
  }
  
  // Also save to sessionStorage
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    console.log("💾 Token saved to sessionStorage");
  } catch (err) {
    console.warn("⚠️ sessionStorage save failed:", err);
  }
  
  // Also save to cookie (30 days expiry)
  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `${TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    console.log("💾 Token saved to cookie");
  } catch (err) {
    console.warn("⚠️ cookie save failed:", err);
  }
  
  // Notify all components that token has been updated
  window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
    detail: { token, timestamp: Date.now() } 
  }));
  console.log("📡 Token refresh event dispatched");
}

export function clearStoredToken(): void {
  const TOKEN_KEY = "adhders_token_v1";
  
  // Clear from localStorage
  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log("🗑️ Token cleared from localStorage");
  } catch (err) {
    console.warn("⚠️ localStorage clear failed:", err);
  }
  
  // Clear from sessionStorage
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    console.log("🗑️ Token cleared from sessionStorage");
  } catch (err) {
    console.warn("⚠️ sessionStorage clear failed:", err);
  }
  
  // Clear from cookie
  try {
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log("🗑️ Token cleared from cookie");
  } catch (err) {
    console.warn("⚠️ cookie clear failed:", err);
  }
}
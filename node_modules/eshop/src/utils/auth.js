export const getAccessToken = () => {
  try {
    const auth = localStorage.getItem("_auth");
    if (auth) {
      const { token } = JSON.parse(auth);
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

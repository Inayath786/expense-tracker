import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

function Login() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the Auth0 JWT token
        let token = await getAccessTokenSilently();

        // Save token to localStorage (optional)
        localStorage.setItem("token", token);

        // Call your backend with the token
        const res = await axios.get("http://localhost:5000/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Data from backend:", res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <>
      {isAuthenticated ? (
        <div>
          <img src={user.picture} alt={user.name} />
          <p>Hello {user.name}</p>
          <p>Email: {user.email}</p>
          <button onClick={() => logout()}>Logout</button>
          <button>
            <Link to="/form">Go to Next Page</Link>
          </button>
        </div>
      ) : (
        <button onClick={() => loginWithRedirect()}>Login</button>
      )}
    </>
  );
}

export default Login;

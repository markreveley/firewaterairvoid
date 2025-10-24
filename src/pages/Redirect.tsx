import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const Redirect = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const to = params.get("to");
    try {
      if (!to) throw new Error("Missing 'to' param");
      const url = new URL(to);
      // Only allow http(s)
      if (url.protocol === "http:" || url.protocol === "https:") {
        // Use replace so the interim page isn't in history
        window.location.replace(url.toString());
      } else {
        throw new Error("Invalid protocol");
      }
    } catch {
      // Fallback to home
      navigate("/", { replace: true });
    }
  }, [params, navigate]);

  return null;
};

export default Redirect;

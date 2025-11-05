import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TagsRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Default to fire tags management
    navigate("/tags/fire", { replace: true });
  }, [navigate]);

  return null;
};

export default TagsRedirect;

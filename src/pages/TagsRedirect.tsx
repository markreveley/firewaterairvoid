import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TagsRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/tags/projects", { replace: true });
  }, [navigate]);

  return null;
};

export default TagsRedirect;

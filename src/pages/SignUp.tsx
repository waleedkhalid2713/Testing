import * as React from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/auth?mode=signup", { replace: true });
  }, [navigate]);

  return null;
};

export default SignUp;

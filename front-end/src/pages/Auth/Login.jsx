import { useState } from "react";
import { Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../../assets/ambulance 1.png";
import { Link } from "react-router-dom";
import { login } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      message.warning("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      const data = { email, password };
      const res = await login(data);

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        message.success("เข้าสู่ระบบสำเร็จ");
        const token = localStorage.getItem("token"); // ดึง token จาก localStorage
        if (token) {
          try {
            const decodedToken = jwtDecode(token); // decode token
            //Check role
            navigate("/admin/dashboard");

            console.log(decodedToken);
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        }
      } else {
        message.error("เข้าสู่ระบบไม่สำเร็จ: ข้อมูลไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err);
      message.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <Card className="p-10 rounded-3xl shadow-xl w-[400px] bg-white border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700">
              🚑 ระบบรับส่งผู้ป่วย
            </h2>
            <p className="text-gray-500 text-sm ">
              เข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </div>
          <div className="mt-8 space-y-5">
            <Input
              size="large"
              placeholder="อีเมล"
              prefix={<UserOutlined className="text-gray-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg"
            />

            <Input.Password
              size="large"
              placeholder="รหัสผ่าน"
              prefix={<LockOutlined className="text-gray-400" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
            />
            <Button
              type="primary"
              size="large"
              block
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-lg font-medium"
              onClick={handleLogin}
            >
              เข้าสู่ระบบ
            </Button>
            <p className="text-center text-gray-500 text-sm mt-4">
              ไม่มีบัญชี?{" "}
              <Link
                to="/auth/register"
                className="text-blue-600 hover:underline"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

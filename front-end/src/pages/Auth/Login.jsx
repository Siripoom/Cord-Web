import { useState } from "react";
import { Input, Button, Card, message, Form, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data = {
        email: values.email.trim(),
        password: values.password,
      };
      const res = await login(data);

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        message.success("เข้าสู่ระบบสำเร็จ");

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            // Check role and redirect accordingly
            if (decodedToken.role === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/");
            }
            console.log(decodedToken);
          } catch (error) {
            console.error("Error decoding token:", error);
            navigate("/");
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
    <div className="login-container">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
      </div>

      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">
              <div className="logo-icon">🎵</div>
              <h1 className="brand-title">Chord Style</h1>
            </div>
            <p className="brand-subtitle">ยินดีต้อนรับสู่แพลตฟอร์มคอร์ดเพลง</p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">🎸</div>
                <span>คอร์ดเพลงครบครัน</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎼</div>
                <span>ปรับคีย์ได้ตามต้องการ</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <span>ใช้งานง่ายทุกอุปกรณ์</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <Card className="login-card">
            <div className="login-header">
              <h2 className="login-title">เข้าสู่ระบบ</h2>
              <p className="login-subtitle">
                ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบ
              </p>
            </div>

            <Form
              form={form}
              name="login-form"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="email"
                label="อีเมล"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="กรอกอีเมลของคุณ"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="รหัสผ่าน"
                rules={[
                  { required: true, message: "กรุณากรอกรหัสผ่าน" },
                  { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="custom-input"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <div className="form-options">
                <div className="remember-forgot">
                  <Link to="/auth/forgot-password" className="forgot-link">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              </div>

              <Form.Item className="login-button-item">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-button"
                  block
                >
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

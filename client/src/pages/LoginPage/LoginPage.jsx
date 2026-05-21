import { Link, useLocation, useNavigate } from "react-router";
import Input from "../../components/ui/Input/Input";
import { isNotEmpty, validateEmail } from "../../utils/validate";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Mail, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import styles from "../RegisterPage/RegisterPage.module.css";

function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const resendVerify = useAuthStore((state) => state.resendVerify);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const actParam = params.get("activated");
  const reasonParam = params.get("reason");

  const activatedStatus =
    actParam === "true" ? "success" : actParam === "false" ? "failed" : null;

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(() => {
    if (actParam === "false" && reasonParam === "invalid_token") {
      return {
        apiError:
          "Невірний або прострочений токен активації. Будь ласка, замовте новий лист.",
      };
    }
    return {};
  });

  const [resendEmail, setResendEmail] = useState("");
  const [apiSuccessMessage, setApiSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isNotEmpty(formData.email)) newErrors.email = "Email обов'язковий";
    if (!isNotEmpty(formData.password))
      newErrors.password = "Пароль обов'язковий";
    if (isNotEmpty(formData.email) && !validateEmail(formData.email)) {
      newErrors.email = "Некоректний формат електронної пошти";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiSuccessMessage("");

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrors({ apiError: result.error });
    }
  };

  const handleResendFromLogin = async (e) => {
    e.preventDefault();
    if (countdown > 0) return;

    if (!isNotEmpty(resendEmail)) {
      setErrors({ resendError: "Введіть email для відправки" });
      return;
    }
    if (!validateEmail(resendEmail)) {
      setErrors({ resendError: "Некоректний формат електронної пошти" });
      return;
    }

    setErrors({});
    setApiSuccessMessage("");

    const result = await resendVerify(resendEmail);

    if (result.success) {
      setApiSuccessMessage("Лист із підтвердженням успішно надіслано!");
      setCountdown(60); // Блокуємо кнопку на 60 секунд
    } else {
      setErrors({ apiError: result.error || "Помилка при відправці" });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Вхід до акаунту</h2>
        <p className={styles.subtitle}>
          З поверненням до QuizBee! Раді тебе бачити знову
        </p>

        {/* Блок успіху */}
        {(activatedStatus === "success" || apiSuccessMessage) && (
          <div className={styles.successBlock}>
            <CheckCircle2 size={20} className={styles.successIcon} />
            <div>
              {apiSuccessMessage ||
                "Акаунт успішно активовано. Тепер ви можете увійти."}
            </div>
          </div>
        )}

        {/* Блок помилки з сервера */}
        {errors.apiError && (
          <div className={styles.apiError}>{errors.apiError}</div>
        )}

        {/*  Помилка активації — показуємо лише форму повторного запиту листа */}
        {activatedStatus === "failed" ? (
          <div className={styles.verifyContainer}>
            <p className={styles.verifyText}>
              Щоб отримати нове посилання для активації профілю, введіть ваш
              Email нижче:
            </p>

            <form
              onSubmit={handleResendFromLogin}
              className={styles.form}
              style={{ width: "100%" }}
            >
              <Input
                label="Електронна пошта"
                name="resendEmail"
                type="email"
                placeholder="example@gmail.com"
                icon={Mail}
                value={resendEmail}
                onChange={(e) => {
                  setResendEmail(e.target.value);
                  if (errors.resendError)
                    setErrors({ ...errors, resendError: null });
                }}
                error={errors.resendError}
              />

              <button
                type="submit"
                className={styles.resendBtn}
                disabled={countdown > 0 || isSubmitting}
              >
                <RefreshCw
                  size={16}
                  className={countdown > 0 ? styles.spin : ""}
                />
                {isSubmitting
                  ? "Надсилання..."
                  : countdown > 0
                    ? `Надіслати повторно (${countdown}с)`
                    : "Надіслати новий лист"}
              </button>
            </form>

            {/* Дозволяємо повернутися назад до звичайного логіну без перезавантаження сторінки */}
            <button
              onClick={() => {
                navigate("/login", { replace: true });
                setErrors({});
                setApiSuccessMessage("");
              }}
              className={styles.link}
              style={{
                background: "none",
                border: "none",
                marginTop: 10,
                cursor: "pointer",
              }}
            >
              Повернутися до форми входу
            </button>
          </div>
        ) : (
          /* Стандартний вхід */
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Електронна пошта"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Пароль"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Вхід..." : "Увійти"}
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          Ще не маєте акаунту?{" "}
          <Link to="/register" className={styles.link}>
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

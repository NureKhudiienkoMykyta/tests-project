import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Mail,
  Lock,
  User as UserIcon,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import styles from "./RegisterPage.module.css";
import { useAuthStore } from "../../stores/useAuthStore";
import { getAllUniversities } from "../../services/university.service";
import Select from "../../components/ui/Select/Select";
import Input from "../../components/ui/Input/Input";
import {
  isNotEmpty,
  validateEmail,
  validatePassword,
} from "../../utils/validate";

function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const resendVerify = useAuthStore((state) => state.resendVerify);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);

  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    universityId: null,
  });

  const [errors, setErrors] = useState({});

  const [isRegistered, setIsRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getAllUniversities();

        setUniversities(data.data);
      } catch (err) {
        console.error("Не вдалося завантажити університети", err);
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleUniversitySelect = (id) => {
    setFormData({ ...formData, universityId: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!isNotEmpty(formData.firstName))
      newErrors.firstName = "Ім'я обов'язкове";
    if (!isNotEmpty(formData.lastName))
      newErrors.lastName = "Прізвище обов'язкове";
    if (!isNotEmpty(formData.email)) newErrors.email = "Email обов'язковий";
    if (!isNotEmpty(formData.password))
      newErrors.password = "Пароль обов'язковий";

    if (isNotEmpty(formData.email) && !validateEmail(formData.email)) {
      newErrors.email = "Некоректний формат електронної пошти";
    }

    if (isNotEmpty(formData.password) && !validatePassword(formData.password)) {
      newErrors.password =
        "Пароль має містити від 8 до 16 символів (лише латиниця, цифри та _)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const result = await register(formData);

    if (result.success) {
      setIsRegistered(true);
      setSuccessMessage(
        result.message || "Лист з підтвердженням відправлено на вашу пошту!",
      );
      setCountdown(60);
    } else {
      setErrors({ apiError: result.error });
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setErrors({});
    setSuccessMessage("");

    const result = await resendVerify(formData.email);

    if (result.success) {
      setSuccessMessage("Новий лист із підтвердженням успішно надіслано!");
      setCountdown(60);
    } else {
      setErrors({ apiError: result.error });
    }
  };
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Створення акаунту</h2>
        <p className={styles.subtitle}>
          Приєднуйся до розумного ком'юніті QuizBee
        </p>

        {/* лок успішного повідомлення */}
        {successMessage && (
          <div className={styles.successBlock}>
            <CheckCircle2 size={20} className={styles.successIcon} />
            <div>{successMessage}</div>
          </div>
        )}

        {/* лок помилки з сервера */}
        {errors.apiError && (
          <div className={styles.apiError}>{errors.apiError}</div>
        )}

        {!isRegistered ? (
          /* ШАБЛОН ФОРМИ РЕЄСТРАЦІЇ */
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Ім'я"
                name="firstName"
                placeholder="Ім'я"
                icon={UserIcon}
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <Input
                label="Прізвище"
                name="lastName"
                placeholder="Прізвище"
                icon={UserIcon}
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
            </div>

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

            <Select
              label="Ваш ЗВО (Необов'язково)"
              placeholder="Почніть вводити назву університету..."
              options={universities}
              onSelect={handleUniversitySelect}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
            </button>
          </form>
        ) : (
          /* Очікування підтвердження */
          <div className={styles.verifyContainer}>
            <p className={styles.verifyText}>
              Будь ласка, перевірте скриньку <strong>{formData.email}</strong>{" "}
              та перейдіть за посиланням у листі для активації облікового
              запису.
            </p>

            <button
              type="button"
              onClick={handleResendEmail}
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
                  : "Надіслати лист повторно"}
            </button>
          </div>
        )}

        <p className={styles.footerText}>
          Вже маєте акаунт?{" "}
          <Link to="/login" className={styles.link}>
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

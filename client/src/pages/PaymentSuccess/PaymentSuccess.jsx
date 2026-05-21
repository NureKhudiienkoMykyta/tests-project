import PaymentStatus from "../../components/PaymentStatus/PaymentStatus";

function PaymentSuccess() {
  return (
    <PaymentStatus
      isSuccess={true}
      title="Платіж успішний! ✓"
      message="Дякуємо за покупку та підтримку! Ваша підписка активована."
      additionalMessage="Будь ласка, перезавантажте сторінку щоб підписка запрацювала коректно."
    />
  );
}

export default PaymentSuccess;

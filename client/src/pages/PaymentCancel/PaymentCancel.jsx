import PaymentStatus from "../../components/PaymentStatus/PaymentStatus";

function PaymentCancel() {
  return (
    <PaymentStatus
      isSuccess={false}
      title="Платіж скасовано"
      message="На жаль, платіж був відхилений або ви передумали."
      additionalMessage="Ви можете повторити спробу пізніше."
    />
  );
}

export default PaymentCancel;

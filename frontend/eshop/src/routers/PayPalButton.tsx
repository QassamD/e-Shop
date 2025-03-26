// PayPalButton.tsx
import { useEffect } from "react";

export default function PayPalButton() {
  useEffect(() => {
    console.log(import.meta.env.VITE_PAYPAL_CLIENT_ID);

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${
      import.meta.env.VITE_PAYPAL_CLIENT_ID
    }&currency=USD&disable-funding=credit`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paypal-button-container"></div>;
}

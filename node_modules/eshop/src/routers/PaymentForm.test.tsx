// // PaymentForm.test.tsx
// import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import PaymentForm, { Order } from "./PaymentForm";
// import { useParams } from "react-router-dom";
// import useAuthUser from "react-auth-kit/hooks/useAuthUser";
// import { useStripe, useElements } from "@stripe/react-stripe-js";
// import api from "../api/Post";
// import { jest } from "@jest/globals";
// import { Stripe, StripeElements } from "@stripe/stripe-js";

// // Mock dependencies
// jest.mock("react-auth-kit/hooks/useAuthUser");
// jest.mock("react-router-dom", () => ({
//   useParams: jest.fn(),
// }));
// jest.mock("@stripe/react-stripe-js", () => ({
//   useStripe: jest.fn(),
//   useElements: jest.fn(),
//   CardElement: () => <div data-testid="card-element" />,
// }));
// jest.mock("../api/Post");

// // Properly typed Stripe mock
// const mockStripe = {
//   confirmCardPayment: jest.fn() as unknown as Stripe["confirmCardPayment"] &
//     jest.Mock,
//   elements: {
//     create: jest.fn(),
//     fetchUpdates: jest.fn(),
//   },
//   confirmPayment: jest.fn(),
//   redirectToCheckout: jest.fn(),
//   confirmAcssDebitPayment: jest.fn(),
//   _registerWrapper: jest.fn(),
//   registerAppInfo: jest.fn(),
// } as unknown as Stripe;

// // Properly typed Elements mock
// const mockElements = {
//   getElement: jest.fn(),
//   create: jest.fn((type) => ({
//     mount: jest.fn(),
//     update: jest.fn(),
//     on: jest.fn(),
//     unmount: jest.fn(),
//   })),
//   update: jest.fn(),
//   fetchUpdates: jest.fn(),
//   on: jest.fn(),
//   submit: jest.fn(),
//   _commonOptions: {},
//   _frame: null,
//   _paymentMethodOptions: {},
//   _elements: [],
// } as unknown as StripeElements;

// describe("PaymentForm", () => {
//   const mockOrder: Order = {
//     _id: "order123",
//     totalPrice: 99.99,
//     user: {
//       userId: "123",
//       name: "John Doe",
//       email: "john@example.com",
//       isAdmin: false,
//     },
//   };

//   beforeEach(() => {
//     (useAuthUser as jest.MockedFunction<typeof useAuthUser>).mockReturnValue({
//       userId: "123",
//       name: "John Doe",
//       email: "john@example.com",
//       isAdmin: false,
//     });

//     (useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
//       id: "order123",
//     });

//     (useStripe as jest.MockedFunction<typeof useStripe>).mockReturnValue(
//       mockStripe
//     );
//     (useElements as jest.MockedFunction<typeof useElements>).mockReturnValue(
//       mockElements
//     );

//     (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue({
//       data: mockOrder,
//       status: 200,
//       headers: {},
//     });

//     (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue({
//       data: { clientSecret: "secret_123" },
//       status: 200,
//       headers: {},
//     });
//   });

//   test("renders loading state initially", async () => {
//     (useStripe as jest.MockedFunction<typeof useStripe>).mockReturnValue(null);
//     render(<PaymentForm />);
//     expect(
//       screen.getByText(/Initializing payment system/i)
//     ).toBeInTheDocument();
//   });

//   test("handles payment submission success", async () => {
//     (mockStripe.confirmCardPayment as jest.Mock).mockResolvedValue({
//       error: null,
//       paymentIntent: { id: "pi_123" },
//     });

//     render(<PaymentForm />);
//     await waitFor(() => screen.getByText(/Pay \$99\.99/i));

//     fireEvent.submit(screen.getByRole("form"));

//     await waitFor(() => {
//       expect(api.post).toHaveBeenCalledWith(
//         "/api/v1/create-stripe-payment-intent",
//         {
//           amount: 9999,
//           currency: "usd",
//           metadata: {
//             orderId: "order123",
//             userId: "123",
//           },
//         }
//       );
//       expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith("secret_123", {
//         payment_method: {
//           card: expect.anything(),
//           billing_details: {
//             name: "John Doe",
//             email: "john@example.com",
//           },
//         },
//       });
//     });
//   });

//   test("handles payment failure", async () => {
//     (mockStripe.confirmCardPayment as jest.Mock).mockRejectedValue(
//       Promise.reject({
//         type: "card_error",
//         message: "Card declined",
//       })
//     );

//     render(<PaymentForm />);
//     await waitFor(() => screen.getByText(/Pay \$99\.99/i));

//     fireEvent.submit(screen.getByRole("form"));

//     await waitFor(() => {
//       expect(screen.getByText(/Card declined/i)).toBeInTheDocument();
//     });
//   });
// });

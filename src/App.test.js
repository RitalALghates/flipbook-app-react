import { render, screen } from "@testing-library/react";
import App from "./App";

// react-pageflip relies on browser layout APIs that jsdom does not provide,
// so the flipbook is replaced with a simple container for this smoke test.
jest.mock("react-pageflip", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(({ children, className }, ref) => (
      <div className={className}>{children}</div>
    )),
  };
});

test("renders the cover page and the navigation controls", () => {
  render(<App />);

  expect(
    screen.getByText("تمكين عملك بحلول الفوترة الرقمية الذكية")
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "PDF" })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "التالي" }).length).toBeGreaterThan(0);
});

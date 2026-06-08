import { test, expect } from "@playwright/test";
import path from "path";

const paySlipSample = path.join(
  process.cwd(),
  "public/samples/sample-pay-slip.xlsx",
);

test.describe("Home page", () => {
  test("renders hero and analyzer cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-title")).toBeVisible();
    await expect(page.getByTestId("analyzers-grid")).toBeVisible();
    await expect(page.getByTestId("analyzer-card-pay-slip")).toBeVisible();
    await expect(page.getByTestId("analyzer-card-form-106")).toBeVisible();
    await expect(page.getByTestId("sample-files")).toBeVisible();
  });

  test("switches language to English", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("lang-en").click();
    await expect(page.getByTestId("hero-title")).toHaveText("Welcome");
    await expect(page.getByTestId("sample-files")).toContainText("Sample Files");
  });
});

test.describe("Pay slip analysis flow", () => {
  test("uploads sample file and shows accurate results", async ({ page }) => {
    await page.goto("/analyze/pay-slip");
    await expect(page.getByTestId("analyze-page-pay-slip")).toBeVisible();
    await expect(page.getByTestId("upload-zone")).toBeVisible();

    const fileInput = page.getByTestId("file-input");
    await fileInput.setInputFiles(paySlipSample);

    await expect(page.getByTestId("analysis-results")).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByTestId("result-title")).toContainText("יוסי כהן");
    await expect(page.getByTestId("confidence-badge")).toContainText("גבוהה");

    const kpiGrid = page.getByTestId("kpi-grid");
    await expect(kpiGrid).toBeVisible();
    await expect(kpiGrid).toContainText("18,500");
    await expect(kpiGrid).toContainText("14,205");

    await expect(page.getByTestId("field-grossSalary")).toContainText("18,500");
    await expect(page.getByTestId("field-netSalary")).toContainText("14,205");
    await expect(page.getByTestId("field-incomeTax")).toContainText("2,850");
  });

  test("can analyze another file after results", async ({ page }) => {
    await page.goto("/analyze/pay-slip");
    await page.getByTestId("file-input").setInputFiles(paySlipSample);
    await expect(page.getByTestId("analysis-results")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId("analyze-another-btn").click();
    await expect(page.getByTestId("upload-zone")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navigates from home to pay slip analyzer", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("analyzer-link-pay-slip").click();
    await expect(page).toHaveURL(/\/analyze\/pay-slip/);
    await expect(page.getByTestId("upload-zone")).toBeVisible();
  });

  test("back link returns to home", async ({ page }) => {
    await page.goto("/analyze/pay-slip");
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
  });
});

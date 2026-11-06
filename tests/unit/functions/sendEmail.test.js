// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("firebase-functions/logger", () => ({ info: vi.fn(), error: vi.fn() }));
const { sendEmail } = await import("../../../src/backend/functions/src/email/sendEmail.js");

const mail = { to: "a@x.com", toName: "A", subject: "Hi", html: "<p>hi</p>" };

describe("sendEmail switch (EMAILS_ENABLED)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends nothing while emails are off (default during sync)", async () => {
    vi.stubEnv("EMAILS_ENABLED", "");
    vi.stubEnv("BREVO_API_KEY", "k");
    vi.stubEnv("BREVO_FROM_EMAIL", "noreply@x.com");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await sendEmail(mail);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends through Brevo once switched on", async () => {
    vi.stubEnv("EMAILS_ENABLED", "true");
    vi.stubEnv("BREVO_API_KEY", "k");
    vi.stubEnv("BREVO_FROM_EMAIL", "noreply@x.com");
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal("fetch", fetch);
    await sendEmail(mail);
    expect(fetch).toHaveBeenCalledWith("https://api.brevo.com/v3/smtp/email", expect.objectContaining({ method: "POST" }));
  });
});

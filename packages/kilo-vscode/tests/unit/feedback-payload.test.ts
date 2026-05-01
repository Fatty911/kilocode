import { describe, it, expect } from "bun:test"
import { buildFeedbackProperties, isKiloGateway } from "../../webview-ui/src/context/feedback-payload"

const baseInput = {
  messageID: "msg_abc",
  sessionID: "ses_xyz",
  parentMessageID: "msg_parent",
  modelID: "claude-sonnet-4-5",
  variant: undefined as string | undefined,
}

describe("isKiloGateway", () => {
  it("matches the canonical kilo provider", () => {
    expect(isKiloGateway("kilo")).toBe(true)
  })

  it("matches aliased kilo providers", () => {
    expect(isKiloGateway("kilo-dev")).toBe(true)
    expect(isKiloGateway("kilocloud")).toBe(true)
  })

  it("does not match direct providers", () => {
    expect(isKiloGateway("anthropic")).toBe(false)
    expect(isKiloGateway("openai")).toBe(false)
    expect(isKiloGateway("openrouter")).toBe(false)
  })
})

describe("buildFeedbackProperties — non-Kilo providers", () => {
  it("includes only provider/model/rating (no session or message IDs)", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "anthropic", next: "up" })
    expect(props).toEqual({
      providerID: "anthropic",
      modelID: "claude-sonnet-4-5",
      rating: "up",
    })
    expect(props).not.toHaveProperty("sessionID")
    expect(props).not.toHaveProperty("messageID")
    expect(props).not.toHaveProperty("parentMessageID")
  })

  it("includes variant when set", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "openai", variant: "preview", next: "down" })
    expect(props.variant).toBe("preview")
  })

  it("includes previousRating when provided", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "anthropic", next: "down" }, "up")
    expect(props.previousRating).toBe("up")
  })

  it("uses 'cleared' when next is null", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "anthropic", next: null }, "up")
    expect(props.rating).toBe("cleared")
    expect(props.previousRating).toBe("up")
  })
})

describe("buildFeedbackProperties — Kilo Gateway", () => {
  it("includes sessionID, messageID, parentMessageID", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "kilo", next: "up" })
    expect(props).toEqual({
      providerID: "kilo",
      modelID: "claude-sonnet-4-5",
      rating: "up",
      sessionID: "ses_xyz",
      messageID: "msg_abc",
      parentMessageID: "msg_parent",
    })
  })

  it("treats aliased kilo providers the same", () => {
    const props = buildFeedbackProperties({ ...baseInput, providerID: "kilo-cloud", next: "up" })
    expect(props.sessionID).toBe("ses_xyz")
    expect(props.messageID).toBe("msg_abc")
    expect(props.parentMessageID).toBe("msg_parent")
  })
})

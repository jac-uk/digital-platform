import getIdFromUrl from "@/utils/helpers/getIdFromUrl.js";

describe("getIdFromUrl", () => {

  const initNewWindow = (path) => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: path
      },
      writable: true
    });
  }

  it("returns an ID from URL if exists", () => {
    initNewWindow("/test/Q3QPebYC4it3Orp4RtA7/take");

    expect(getIdFromUrl()).toBe("Q3QPebYC4it3Orp4RtA7");
  });

  it("returns undefined if ID is not found", () => {
    initNewWindow("/take/34674365");

    expect(getIdFromUrl()).toBe(undefined);
  })
})
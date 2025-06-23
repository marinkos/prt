const textEl = document.querySelector('[wb-data="text"]');
const splitText = new SplitText(textEl, { type: "lines" });
gsap.set(textEl, { autoAlpha: 1 });
gsap.from(splitText.lines, {
    autoAlpha: 0,
    lineHeight: "3em",
    duration: 1.5,
    clearProps: "lineHeight"
});
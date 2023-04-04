export default {
  bind(el) {
    const onMouseMove = (e) => {
      el.style.left = e.clientX - el.draggableOffsetX + "px";
      el.style.top = e.clientY - el.draggableOffsetY + "px";
    };

    el.onmousedown = (e) => {
      el.draggableOffsetX = e.clientX - el.getBoundingClientRect().left;
      el.draggableOffsetY = e.clientY - el.getBoundingClientRect().top;
      document.addEventListener("mousemove", onMouseMove);
    };

    el.onmouseup = () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  },
};

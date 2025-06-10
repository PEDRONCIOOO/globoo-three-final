export function initCursor() {
  const cursor = document.querySelector(".cursor");
  const cursorFollower = document.querySelector(".cursor-follower");

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  // Update mouse position
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
  });

  // Smooth follower animation
  function animateFollower() {
    const speed = 0.15;

    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;

    cursorFollower.style.left = followerX + "px";
    cursorFollower.style.top = followerY + "px";

    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects
  const hoverElements = document.querySelectorAll(
    "button, a, .feature-item, .card, .service-card"
  );

  hoverElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
      cursorFollower.classList.add("cursor-hover");
    });

    element.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
      cursorFollower.classList.remove("cursor-hover");
    });
  });

  // Click effect
  document.addEventListener("mousedown", () => {
    cursor.classList.add("cursor-click");
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("cursor-click");
  });
}
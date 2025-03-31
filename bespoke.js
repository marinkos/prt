//hero animation
    function initSimulation() {
        var Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Events = Matter.Events,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          World = Matter.World,
          Bodies = Matter.Bodies;
      
        var engine = Engine.create(),
          world = engine.world;
        var containerElement = document.querySelector(".tag-canvas");
        var containerWidth = containerElement.clientWidth + 2;
        var containerHeight = containerElement.clientHeight + 2;
      
        var render = Render.create({
          element: containerElement,
          engine: engine,
          options: {
            width: containerWidth,
            height: containerHeight,
            pixelRatio: 2,
            background: "transparent",
            border: "none",
            wireframes: false,
          },
        });
      
        var ground = Bodies.rectangle(
          containerWidth / 2 + 160,
          containerHeight + 80,
          containerWidth + 320,
          160,
          { render: { fillStyle: "#000000" }, isStatic: true }
        );
        var wallLeft = Bodies.rectangle(
          -80,
          containerHeight / 2,
          160,
          containerHeight,
          { isStatic: true }
        );
        var wallRight = Bodies.rectangle(
          containerWidth + 80,
          containerHeight / 2,
          160,
          1200,
          { isStatic: true }
        );
        var roof = Bodies.rectangle(
          containerWidth / 2 + 160,
          -80,
          containerWidth + 320,
          160,
          { isStatic: true }
        );
      
        // Function to create multiple bodies at once
        function createMultipleBodies(count, options) {
          const bodies = [];
          const containerWidth = options.containerWidth;
          const containerHeight = options.containerHeight;
          
          // Calculate distribution width for better spreading
          const distributionWidth = containerWidth * 0.8;
          const startX = (containerWidth - distributionWidth) / 2;
          
          const textures = [
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d539bba8c136e176805_cypago.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5359a299f6dc6e9848_verax.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53d18f7f9092d96caa_northbit.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53e9f0939c22c652c8_cybellum.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53a173bf929fe10d20_tlist.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d531c941b828218bf7d_vocai.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53d75fb92a39ae2c56_ramon.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5343b4af4d24382ca5_biomix.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5340c852ea8e99b895_tag04.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53748985d4217fd012_indegy.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53f26ec9327a5aa0e3_syracuse.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5306a9c51e040a8e26_elements.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5307a0437d45de4f08_dig.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53ce1c9cf0e749b4ec_profile.svg",
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53f3825810156d115c_commbox.svg"
          ];
          
          for (let i = 0; i < count; i++) {
            // Stagger positions: distribute horizontally and start from above viewport
            const x = startX + (distributionWidth / (count-1)) * i + (Math.random() * 40 - 20);
            const y = -50 - (i * 30) - (Math.random() * containerHeight * 0.1);
            
            const randomTexture = textures[Math.floor(Math.random() * textures.length)];
            const width = Math.floor(Math.random() * 140) + 100;
            const height = 56;
            
            const body = Bodies.rectangle(x, y, width, height, {
              chamfer: { radius: options.radius },
              render: {
                sprite: {
                  texture: randomTexture,
                  xScale: 1.1,
                  yScale: 1.1
                }
              },
              inertia: Infinity, // Prevent rotation
              friction: 0.5,     // Add some friction
              frictionAir: 0.02, // Add slight air resistance
              restitution: 0.3   // Make them slightly bouncy
            });
            
            bodies.push(body);
          }
          
          return bodies;
        }
      
        // Create multiple falling bodies
        const fallingBodies = createMultipleBodies(15, {
          containerWidth: containerWidth,
          containerHeight: containerHeight,
          radius: 20
        });
      
        // Add all elements to the world
        World.add(engine.world, [
          ground,
          wallLeft,
          wallRight,
          roof,
          ...fallingBodies
        ]);
      
        var mouse = Mouse.create(render.canvas),
          mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
              stiffness: 0.2,
              render: {
                visible: false,
              },
            },
          });
      
        World.add(world, mouseConstraint);
      
        render.mouse = mouse;
      
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
      
        let click = false;
      
        document.addEventListener("mousedown", () => (click = true));
        document.addEventListener("mousemove", () => (click = false));
        document.addEventListener("mouseup", () =>
          console.log(click ? "click" : "drag")
        );
      
        Events.on(mouseConstraint, "mouseup", function (event) {
          var mouseConstraint = event.source;
          var bodies = engine.world.bodies;
          if (!mouseConstraint.bodyB) {
            for (i = 0; i < bodies.length; i++) {
              var body = bodies[i];
              if (click === true) {
                if (
                  Matter.Bounds.contains(body.bounds, mouseConstraint.mouse.position)
                ) {
                  var bodyUrl = body.url;
                  console.log("Body.Url >> " + bodyUrl);
                  if (bodyUrl != undefined) {
                    window.open(bodyUrl, "_blank");
                    console.log("Hyperlink was opened");
                  }
                  break;
                }
              }
            }
          }
        });
      
        // Use the Matter.Runner instead of Engine.run
        var runner = Runner.create();
        Runner.run(runner, engine);
      
        Render.run(render);
      }
      
      var containerElement = document.querySelector(".tag-canvas");
      
      var observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initSimulation();
            observer.disconnect();
          }
        });
      }, {});
      
      observer.observe(containerElement);

  //Buttons animation
  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('[data-gsap="btn"]');
    
    if (buttons.length === 0) {
        console.error('No buttons with data-gsap="btn.x2" found');
        return;
    }

    buttons.forEach((button, index) => {
        // Select the original text element within the button
        const originalText = button.querySelector('.btn-text');
        
        if (!originalText) {
            console.error(`Element with class "btn-text" not found inside button ${index + 1}`);
            return;
        }

        new SplitType(originalText, { types: 'chars' });

        const clonedText = originalText.cloneNode(true);
        button.appendChild(clonedText);

        new SplitType(clonedText, { types: 'chars' });

        const originalChars = originalText.querySelectorAll('.char');
        const clonedChars = clonedText.querySelectorAll('.char');

        gsap.set(clonedText, { position: "absolute" });
        gsap.set(clonedChars, { y: '100%' });

        button.addEventListener('mouseenter', () => {
            animateChars(originalChars, '-100%');
            animateChars(clonedChars, '0%');
        });

        button.addEventListener('mouseleave', () => {
            animateChars(originalChars, '0%');
            animateChars(clonedChars, '100%');
        });
    });
});

function animateChars(chars, yPosition) {
    gsap.to(chars, {
        y: yPosition,
        duration: 0.5,
        ease: "power1.inOut",
        stagger: 0.02
    });
}



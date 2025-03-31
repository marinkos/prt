//hero animation
function initSimulation() {
    var Engine = Matter.Engine,
      Render = Matter.Render,
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
  
    var border = 1;
    var radius = 20;
  
    var tagUiUx = Bodies.rectangle(containerWidth / 2 + 150, 500, 164, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d539bba8c136e176805_cypago.svg",
          xScale: 1,
          yScale: 1,
        },
      },
    });
    var tagWordpress = Bodies.rectangle(containerWidth / 2 + 150, 460, 240, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5359a299f6dc6e9848_verax.svg",
          xScale: 1,
          yScale: 1,
        },
      },
    });
    var tagWebflow = Bodies.rectangle(containerWidth / 2 + 250, 420, 200, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53d18f7f9092d96caa_northbit.svg",
          xScale: 1,
          yScale: 1,
        },
      },
    });
    var tagWhitelevel = Bodies.rectangle(containerWidth / 2 - 75, 380, 160, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53e9f0939c22c652c8_cybellum.svg",
          xScale: 1,
          yScale: 1,
        },
      },
    });
  
    var tagWebflowgreen = Bodies.rectangle(
      containerWidth / 2 - 74,
      540,
      248,
      56,
      {
        chamfer: { radius: radius },
        render: {
          sprite: {
            texture:
              "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53a173bf929fe10d20_tlist.svg",
            xScale: 1.1,
            yScale: 1.1,
          },
        },
      }
    );
    var tagSass = Bodies.rectangle(containerWidth / 2 + 174, 490, 105, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d531c941b828218bf7d_vocai.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagWeb = Bodies.rectangle(containerWidth / 2 - 142, 440, 186, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d531c941b828218bf7d_vocai.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagStartup = Bodies.rectangle(containerWidth / 2 - 10, 260, 128, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53d75fb92a39ae2c56_ramon.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagMaintence = Bodies.rectangle(containerWidth / 2 - 242, 420, 168, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5343b4af4d24382ca5_biomix.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagIntegration = Bodies.rectangle(containerWidth / 2 + 60, 380, 155, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5340c852ea8e99b895_tag04.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagMotion = Bodies.rectangle(containerWidth / 2, 360, 180, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53748985d4217fd012_indegy.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagPay = Bodies.rectangle(containerWidth / 2 - 59, 260, 172, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53f26ec9327a5aa0e3_syracuse.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagGsap = Bodies.rectangle(containerWidth / 2 - 59, 260, 115, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5306a9c51e040a8e26_elements.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagFigma = Bodies.rectangle(containerWidth / 2 - 59, 260, 210, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d5307a0437d45de4f08_dig.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagMigration = Bodies.rectangle(containerWidth / 2 - 59, 260, 145, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53ce1c9cf0e749b4ec_profile.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    var tagMigration = Bodies.rectangle(containerWidth / 2 - 59, 260, 145, 56, {
      chamfer: { radius: radius },
      render: {
        sprite: {
          texture:
            "https://cdn.prod.website-files.com/67e6304f06a9c51e04fe33e4/67e63d53f3825810156d115c_commbox.svg",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
  
    World.add(engine.world, [
      ground,
      wallLeft,
      wallRight,
      roof,
      tagUiUx,
      tagWordpress,
      tagWebflow,
      tagWhitelevel,
      tagWebflowgreen,
      tagSass,
      tagWeb,
      tagStartup,
      tagMaintence,
      tagIntegration,
      tagMotion,
      tagPay,
      tagGsap,
      tagFigma,
      tagMigration,
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
  
    Engine.run(engine);
  
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



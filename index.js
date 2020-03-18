const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

//config
const cellsHorizontal = 6;
const cellsVertical = 6;
const width = window.innerWidth;
const height = window.innerHeight;

//every rectangle made width
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
//remove gravity from Y
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		width,
		height,
	},
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
	//top
	Bodies.rectangle(width / 2, 0, width, 5, {
		isStatic: true,
	}),
	//bottom
	Bodies.rectangle(width / 2, height, width, 5, {
		isStatic: true,
	}),
	//leftside
	Bodies.rectangle(0, height / 2, 5, height, {
		isStatic: true,
	}),
	//rightside
	Bodies.rectangle(width, height / 2, 5, height, {
		isStatic: true,
	}),
];
World.add(world, walls);

//maze generating

const shuffle = arr => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);

		counter--;

		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

const grid = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

//vertical lines
const verticals = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal - 1).fill(false));

//horizontal lines
const horizontals = Array(cellsVertical - 1)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

//find random starting spot
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const iterateCells = (row, column) => {
	//if visited cell at [row, column] then return
	if (grid[row][column]) {
		return;
	}

	//mark this cell as visited in const grid.
	grid[row][column] = true;

	//assemble random ordered list of neighbours
	const neighbours = shuffle([
		// top
		[row - 1, column, "up"],
		//right
		[row, column + 1, "right"],
		//below
		[row + 1, column, "down"],
		// left
		[row, column - 1, "left"],
	]);

	//for each neighbour...
	for (let neighbour of neighbours) {
		const [nextRow, nextColumn, direction] = neighbour;

		//see if neighbour is out of bounds
		if (
			nextRow < 0 ||
			nextRow >= cellsVertical ||
			nextColumn < 0 ||
			nextColumn == cellsHorizontal
		) {
			continue;
		}

		//check to see if we have visited neighbour, continue to next neighbour
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		//remove wall from either horizonal or veritcal
		//vertical lines
		if (direction === "left") {
			verticals[row][column - 1] = true;
		} else if (direction === "right") {
			verticals[row][column] = true;
		} else if (direction === "up") {
			horizontals[row - 1][column] = true;
		} else if (direction === "down") {
			horizontals[row][column] = true;
		}

		iterateCells(nextRow, nextColumn);
	}

	//remove wall from either horizonal or veritcal

	//visit that next cell
};

iterateCells(startRow, startColumn);

//fill with rectangle
horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open === true) {
			return;
		}

		const wall = Bodies.rectangle(
			//center in X
			columnIndex * unitLengthX + unitLengthX / 2,
			//center point y
			rowIndex * unitLengthY + unitLengthY,
			//how wide
			unitLengthX,
			//how high
			5,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "#2121DE",
				},
			}
		);
		World.add(world, wall);
	});
});

//verticals
verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX,
			rowIndex * unitLengthY + unitLengthY / 2,
			//how wide
			5,
			//how high
			unitLengthY,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "#2121DE",
				},
			}
		);
		World.add(world, wall);
	});
});

//make the winning spot
const goal = Bodies.rectangle(
	//x coords
	width - unitLengthX / 2,
	//Y co ords
	height - unitLengthY / 2,
	//height of goal box
	unitLengthX * 0.7,
	//width of goal box
	unitLengthY * 0.7,
	{
		label: "goal",
		isStatic: true,
		render: {
			fillStyle: "#00FF00",
		},
	}
);
World.add(world, goal);

//Ball
//find which measurement is smallest
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
	//X of middle of ball
	unitLengthX / 2,
	//Y of middle of ball
	unitLengthY / 2,
	//radius of ball
	ballRadius,
	{
		label: "ball",
		render: {
			fillStyle: "#FFFF00",
		},
	}
);

World.add(world, ball);

//keypress for controls

document.addEventListener("keydown", event => {
	//velocity of ball
	const { x, y } = ball.velocity;
	//up
	if (event.keyCode === 87) {
		Body.setVelocity(ball, { x, y: y - 5 });
	}
	//right
	if (event.keyCode === 68) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	//down
	if (event.keyCode === 83) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	//left
	if (event.keyCode === 65) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

//win condition
Events.on(engine, "collisionStart", event => {
	event.pairs.forEach(collision => {
		const labels = ["ball", "goal"];

		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			document.querySelector(".winner").classList.remove("hidden");
			world.gravity.y = 1;
			world.bodies.forEach(body => {
				if (body.label === "wall") {
					Body.setStatic(body, false);
				}
			});
		}
	});
});

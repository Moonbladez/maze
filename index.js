const { Engine, Render, Runner, World, Bodies } = Matter;

//config
const cells = 8;
const width = 600;
const height = 600;

//every rectangle made width
const unitLength = width / cells;

const engine = Engine.create();
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

const grid = Array(cells)
	.fill(null)
	.map(() => Array(cells).fill(false));

//vertical lines
const verticals = Array(cells)
	.fill(null)
	.map(() => Array(cells - 1).fill(false));

//horizontal lines
const horizontals = Array(cells - 1)
	.fill(null)
	.map(() => Array(cells).fill(false));

//find random starting spot
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

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
			nextRow >= cells ||
			nextColumn < 0 ||
			nextColumn == cells
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
			columnIndex * unitLength + unitLength / 2,
			rowIndex * unitLength + unitLength,
			//how wide
			unitLength,
			//how high
			10,
			{
				isStatic: true,
			}
		);
		World.add(world, wall);
	});
});

verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLength + unitLength,
			rowIndex * unitLength + unitLength / 2,
			//how wide
			10,
			//how high
			unitLength,
			{
				isStatic: true,
			}
		);
		World.add(world, wall);
	});
});

//make the winning spot
const goal = Bodies.rectangle(
	//x coords
	width - unitLength / 2,
	//Y co ords
	height - unitLength / 2,
	//height of goal box
	unitLength * 0.7,
	//width of goal box
	unitLength * 0.7,
	{
		isStatic: true,
	}
);
World.add(world, goal);

//Ball
const ball = Bodies.circle(
	//X of middle of ball
	unitLength / 2,
	//Y of middle of ball
	unitLength / 2,
	//radius of ball
	unitLength / 4
);

World.add(world, ball);

const { Engine, Render, Runner, World, Bodies } = Matter;

//config
const cells = 3;
const width = 600;
const height = 600;

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
	Bodies.rectangle(width / 2, 0, width, 40, {
		isStatic: true,
	}),
	//bottom
	Bodies.rectangle(width / 2, height, width, 40, {
		isStatic: true,
	}),
	//leftside
	Bodies.rectangle(0, height / 2, 40, height, {
		isStatic: true,
	}),
	//rightside
	Bodies.rectangle(width, height / 2, 40, height, {
		isStatic: true,
	}),
];
World.add(world, walls);

//maze generating
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
console.log(startRow, startColumn);

const iterateCells = (row, column) => {
    //if visited cell at [row, column] then return

    //mark this cell as visited in const grid.

    //assemble random ordered list of neighbours

    //for each neighbour...

    //see if neighbour is out of bounds

    //check to see if we have visited neighbour, continue to next neighbour

    //remove wall from either horizonal or veritcal

    //visit that next cell
};

iterateCells(startRow, startColumn);

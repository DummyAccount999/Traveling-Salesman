import { GeneticGraph } from './GeneticGraph';
import { Point } from './Point';

export class Population {
    populationSize: number = 0;
    population: GeneticGraph[] = [];
    totalFitness: number = 0;
    mutationRate = 0.1;

    bestContender: GeneticGraph = undefined;

    constructor(popSize: number, points: Point[], mutationRate: number) {
        this.populationSize = popSize;
        this.mutationRate = mutationRate;
        
        for (let i = 0; i < this.populationSize; i++) {
            let newGraph = new GeneticGraph(points);
            newGraph.randomizePoints();
            newGraph.calculateFitness();

            this.population.push(newGraph);
        }
    }

    breed(): void {
        let newGeneration: GeneticGraph[] = [];
        newGeneration[0] = this.bestContender.deepCopy();

        for (let i = 1; i < this.populationSize; i++) {
            let parent1 = this.getParent();
            let parent2 = this.getParent();

            let child = this.generateChild(parent1, parent2);
            child.mutate(this.mutationRate);

            newGeneration.push(child);
        }

        this.population = [];

        for (let i = 0; i < newGeneration.length; i++) {
            this.population.push(newGeneration[i].deepCopy());
        }
    }

    generateChild(parent1: GeneticGraph, parent2: GeneticGraph): GeneticGraph {
        let child = new GeneticGraph(parent1.points);
        let firstPassCheck = false;

        for (let i = 0; i < child.points.length; i++)
            child.points[i] = undefined;

        child.points[0] = parent1.points[0];
        let tempVal = parent2.points[0];

        while (!firstPassCheck) {
            for (let i = 0; i < parent1.points.length; i++) {
                if (parent1.points[i].id === tempVal.id) {
                    if (child.points[i] != undefined)
                        firstPassCheck = true;

                    child.points[i] = parent1.points[i];
                    tempVal = parent2.points[i];
                    break;
                }
            }
        }

        for (let i = 0; i < child.points.length; i++) {
            if (child.points[i] === undefined)
                child.points[i] = parent2.points[i];
        }

        return child;
    }

    getParent(): GeneticGraph {
        let rnd = Math.random() * this.totalFitness;
        let runningVal = 0;
        let counter = -1;

        while (runningVal < rnd) {
            counter++;
            runningVal += this.population[counter].fitness;
        }

        return this.population[counter].deepCopy();
    }

    calculateFitness(): void {
        this.totalFitness = 0;
        this.bestContender = this.population[0];

        this.population.forEach((contender) => {
            this.totalFitness += contender.calculateFitness();

            if (contender.fitness > this.bestContender.fitness) {
                this.bestContender = contender;
            }
        });
    }

    getRandomContender(): GeneticGraph {
        let contender = Math.floor(Math.random() * this.population.length);

        return this.population[contender];
    }

    getBestContender(): GeneticGraph {
        let bestContender = this.population[0];

        for (let i = 0; i < this.population.length; i++) {
            if (this.population[i].fitness > bestContender.fitness)
                bestContender = this.population[i];
        }

        return bestContender;
    }
}
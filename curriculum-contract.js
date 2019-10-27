/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Aux = require('./aux.js');
const fs = require('fs');

class CurriculumContract extends Contract {

    async curriculumExists(ctx, cpf) {
        const buffer = await ctx.stub.getState(cpf);
        return (!!buffer && buffer.length > 0);
    }

    async createCurriculum(ctx, cpf, curriculumName) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (exists) {
            throw new Error(`The curriculum ${cpf} already exists`);
        }
        const asset = {
            cpf: cpf,
            name: curriculumName,
            courses: []
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(cpf, buffer);
    }

    async readCurriculum(ctx, cpf) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (!exists) {
            throw new Error(`The curriculum ${cpf} does not exist`);
        }
        const buffer = await ctx.stub.getState(cpf);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateCurriculum(ctx, cpf, curriculumName) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (!exists) {
            throw new Error(`The curriculum ${cpf} does not exist`);
        }
        let curriculum = await ctx.stub.getState(cpf);
        curriculum = JSON.parse(curriculum);
        console.log(curriculum);
        console.log(curriculum.courses);
        const asset = {
            cpf: cpf,
            name: curriculumName,
            courses: curriculum.courses
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(cpf, buffer);
    }

    async deleteCurriculum(ctx, cpf) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (!exists) {
            throw new Error(`The curriculum ${cpf} does not exist`);
        }
        await ctx.stub.deleteState(cpf);
    }

    async createCourse(ctx, cpf, courseName, ...skills) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (!exists) {
            throw new Error('The curriculum does not exist');
        }
        let curriculum = await ctx.stub.getState(cpf);
        curriculum = JSON.parse(curriculum);
        const course = {
            name: courseName,
            skills: skills
        };
        curriculum.courses.push(course);
        const buffer = Buffer.from(JSON.stringify(curriculum));
        await ctx.stub.putState(cpf, buffer);
    }

    async readCurriculumHistory(ctx, cpf) {
        const exists = await this.curriculumExists(ctx, cpf);
        if (!exists) {
            throw new Error('The curriculum does not exist');
        }
        const history = await ctx.stub.getHistoryForKey(cpf);
        const curricumHistory = history !== undefined ? await Aux.iteratorForJSON(history, true) : [];
        const stringCurriculumHistory = JSON.stringify(curricumHistory);
        fs.writeFile('history.json', stringCurriculumHistory, err => {
            if (err) {
                console.error(err);
            } else {
                console.log('History CREATED!');
            }
        });
        return {
            status: 'Ok',
            history: stringCurriculumHistory
        }
    }
}

module.exports = CurriculumContract;

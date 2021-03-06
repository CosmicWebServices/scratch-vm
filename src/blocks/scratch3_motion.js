var Cast = require('../util/cast');
var MathUtil = require('../util/math-util');
var Timer = require('../util/timer');

function Scratch3MotionBlocks(runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    this.runtime = runtime;
}

/**
 * Retrieve the block primitives implemented by this package.
 * @return {Object.<string, Function>} Mapping of opcode to Function.
 */
Scratch3MotionBlocks.prototype.getPrimitives = function() {
    return {
        'motion_movesteps': this.moveSteps,
        'motion_gotoxy': this.goToXY,
        'motion_goto': this.goTo,
        'motion_turnright': this.turnRight,
        'motion_turnleft': this.turnLeft,
        'motion_pointindirection': this.pointInDirection,
        'motion_pointtowards': this.pointTowards,
        'motion_glidesecstoxy': this.glide,
        'motion_setrotationstyle': this.setRotationStyle,
        'motion_changexby': this.changeX,
        'motion_setx': this.setX,
        'motion_changeyby': this.changeY,
        'motion_sety': this.setY,
        'motion_xposition': this.getX,
        'motion_yposition': this.getY,
        'motion_direction': this.getDirection
    };
};

Scratch3MotionBlocks.prototype.moveSteps = function (args, util) {
    var steps = Cast.toNumber(args.STEPS);
    var radians = MathUtil.degToRad(util.target.direction);
    var dx = steps * Math.cos(radians);
    var dy = steps * Math.sin(radians);
    util.target.setXY(util.target.x + dx, util.target.y + dy);
};

Scratch3MotionBlocks.prototype.goToXY = function (args, util) {
    var x = Cast.toNumber(args.X);
    var y = Cast.toNumber(args.Y);
    util.target.setXY(x, y);
};

Scratch3MotionBlocks.prototype.goTo = function (args, util) {
    var targetX = 0;
    var targetY = 0;
    if (args.TO === '_mouse_') {
        targetX = util.ioQuery('mouse', 'getX');
        targetY = util.ioQuery('mouse', 'getY');
    } else if (args.TO === '_random_') {
        var stageWidth = this.runtime.constructor.STAGE_WIDTH;
        var stageHeight = this.runtime.constructor.STAGE_HEIGHT;
        targetX = Math.round(stageWidth * (Math.random() - 0.5));
        targetY = Math.round(stageHeight * (Math.random() - 0.5));
    } else {
        var goToTarget = this.runtime.getSpriteTargetByName(args.TO);
        if (!goToTarget) return;
        targetX = goToTarget.x;
        targetY = goToTarget.y;
    }
    util.target.setXY(targetX, targetY);
};

Scratch3MotionBlocks.prototype.turnRight = function (args, util) {
    var degrees = Cast.toNumber(args.DEGREES);
    util.target.setDirection(util.target.direction + degrees);
};

Scratch3MotionBlocks.prototype.turnLeft = function (args, util) {
    var degrees = Cast.toNumber(args.DEGREES);
    util.target.setDirection(util.target.direction - degrees);
};

Scratch3MotionBlocks.prototype.pointInDirection = function (args, util) {
    var direction = Cast.toNumber(args.DIRECTION);
    util.target.setDirection(direction);
};

Scratch3MotionBlocks.prototype.pointTowards = function (args, util) {
    var targetX = 0;
    var targetY = 0;
    if (args.TOWARDS === '_mouse_') {
        targetX = util.ioQuery('mouse', 'getX');
        targetY = util.ioQuery('mouse', 'getY');
    } else {
        var pointTarget = this.runtime.getSpriteTargetByName(args.TOWARDS);
        if (!pointTarget) return;
        targetX = pointTarget.x;
        targetY = pointTarget.y;
    }

    var dx = targetX - util.target.x;
    var dy = targetY - util.target.y;
    var direction = 90 - MathUtil.radToDeg(Math.atan2(dy, dx));
    util.target.setDirection(direction);
};

Scratch3MotionBlocks.prototype.glide = function (args, util) {
    if (!util.stackFrame.timer) {
        // First time: save data for future use.
        util.stackFrame.timer = new Timer();
        util.stackFrame.timer.start();
        util.stackFrame.duration = Cast.toNumber(args.SECS);
        util.stackFrame.startX = util.target.x;
        util.stackFrame.startY = util.target.y;
        util.stackFrame.endX = Cast.toNumber(args.X);
        util.stackFrame.endY = Cast.toNumber(args.Y);
        if (util.stackFrame.duration <= 0) {
            // Duration too short to glide.
            util.target.setXY(util.stackFrame.endX, util.stackFrame.endY);
            return;
        }
        util.yieldFrame();
    } else {
        var timeElapsed = util.stackFrame.timer.timeElapsed();
        if (timeElapsed < util.stackFrame.duration * 1000) {
            // In progress: move to intermediate position.
            var frac = timeElapsed / (util.stackFrame.duration * 1000);
            var dx = frac * (util.stackFrame.endX - util.stackFrame.startX);
            var dy = frac * (util.stackFrame.endY - util.stackFrame.startY);
            util.target.setXY(
                util.stackFrame.startX + dx,
                util.stackFrame.startY + dy
            );
            util.yieldFrame();
        } else {
            // Finished: move to final position.
            util.target.setXY(util.stackFrame.endX, util.stackFrame.endY);
        }
    }
};

Scratch3MotionBlocks.prototype.setRotationStyle = function (args, util) {
    util.target.setRotationStyle(args.STYLE);
};

Scratch3MotionBlocks.prototype.changeX = function (args, util) {
    var dx = Cast.toNumber(args.DX);
    util.target.setXY(util.target.x + dx, util.target.y);
};

Scratch3MotionBlocks.prototype.setX = function (args, util) {
    var x = Cast.toNumber(args.X);
    util.target.setXY(x, util.target.y);
};

Scratch3MotionBlocks.prototype.changeY = function (args, util) {
    var dy = Cast.toNumber(args.DY);
    util.target.setXY(util.target.x, util.target.y + dy);
};

Scratch3MotionBlocks.prototype.setY = function (args, util) {
    var y = Cast.toNumber(args.Y);
    util.target.setXY(util.target.x, y);
};

Scratch3MotionBlocks.prototype.getX = function (args, util) {
    return util.target.x;
};

Scratch3MotionBlocks.prototype.getY = function (args, util) {
    return util.target.y;
};

Scratch3MotionBlocks.prototype.getDirection = function (args, util) {
    return util.target.direction;
};

module.exports = Scratch3MotionBlocks;

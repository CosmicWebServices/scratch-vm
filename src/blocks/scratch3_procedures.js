function Scratch3ProcedureBlocks(runtime) {
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
Scratch3ProcedureBlocks.prototype.getPrimitives = function() {
    return {
        'procedures_defnoreturn': this.defNoReturn,
        'procedures_callnoreturn': this.callNoReturn,
        'procedures_param': this.param
    };
};

Scratch3ProcedureBlocks.prototype.defNoReturn = function () {
    // No-op: execute the blocks.
};

Scratch3ProcedureBlocks.prototype.callNoReturn = function (args, util) {
    if (!util.stackFrame.executed) {
        var procedureName = args.mutation.proccode;
        var paramNames = util.getProcedureParamNames(procedureName);
        for (var i = 0; i < paramNames.length; i++) {
            if (args.hasOwnProperty('input' + i)) {
                util.pushParam(paramNames[i], args['input' + i]);
            }
        }
        util.stackFrame.executed = true;
        util.startProcedure(procedureName);
    }
};

Scratch3ProcedureBlocks.prototype.param = function (args, util) {
    var value = util.getParam(args.mutation.paramname);
    if (!value) {
        return 0;
    }
    return value;
};

module.exports = Scratch3ProcedureBlocks;

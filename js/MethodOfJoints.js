/**
 * Created by ghassaei on 10/1/16.
 */

function MethodOfJoints(){

    function solveForces(nodes){

        _.each(nodes, function(node){
            node.reset();
        });
        solveIter(nodes);
    }

    function solveIter(nodes){
        var solved = true;
        _.each(nodes, function(node){
            if (node.solve() == false) solved = false;
        });
        if (solved == false) return solveIter(nodes);
    }


    return {
        solveForces:solveForces
    }
}


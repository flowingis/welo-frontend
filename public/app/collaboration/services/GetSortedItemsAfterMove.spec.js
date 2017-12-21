// GetSortedItemsAfterMove.spec.js
describe('GetSortedItemsAfterMove', function(){
    var getSortedItemsAfterMove;
    var sortedItems;

    beforeEach(function(){
        sortedItems = [
            {id: "id_1", position: 1, oldPosition: 1},
            {id: "id_2", position: 2, oldPosition: 2},
            {id: "id_3", position: 3, oldPosition: 3},
            {id: "id_4", position: 4, oldPosition: 4}
        ];
        var $injector = angular.injector(['app.collaboration']);
        getSortedItemsAfterMove = $injector.get('getSortedItemsAfterMove');
    });

    it('should return correctly move up of one position ad correctly update other items position', function(){
        var item = { id: "id_4", position: 4 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 3);
        var resultItem = result[3];
        var movedItem = result[2];
        expect(resultItem.id).toBe("id_4", "wrong result item");
        expect(resultItem.position).toBe(3, "wrong position for result item");

        expect(movedItem.id).toBe("id_3", "wrong moved item");
        expect(movedItem.position).toBe(4, "wrong position for moved item");
    });

    it('should return correctly move up of more position ad correctly update other items position', function(){
        var item = { id: "id_3", position: 3 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 1);
        var resultItem = result[2];
        var movedItem1 = result[0];
        var movedItem2 = result[1];
        var unmovedItem = result[3];
        expect(resultItem.id).toBe("id_3", "wrong result item");
        expect(resultItem.position).toBe(1, "wrong position for result item");

        expect(movedItem1.id).toBe("id_1", "wrong moved item 1");
        expect(movedItem1.position).toBe(2, "wrong position for moved item 1");

        expect(movedItem2.id).toBe("id_2", "wrong moved item 2");
        expect(movedItem2.position).toBe(3, "wrong position for moved item 2");

        expect(unmovedItem.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem.position).toBe(4, "wrong position for unmoved item");
    });

    it('should managed correctly move and return in prev position', function(){
        var item = { id: "id_3", position: 3 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 1);
        var resultItem = result[2];
        var movedItem1 = result[0];
        var movedItem2 = result[1];
        var unmovedItem = result[3];
        expect(resultItem.id).toBe("id_3", "wrong result item");
        expect(resultItem.position).toBe(1, "wrong position for result item");

        expect(movedItem1.id).toBe("id_1", "wrong moved item 1");
        expect(movedItem1.position).toBe(2, "wrong position for moved item 1");

        expect(movedItem2.id).toBe("id_2", "wrong moved item 2");
        expect(movedItem2.position).toBe(3, "wrong position for moved item 2");

        expect(unmovedItem.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem.position).toBe(4, "wrong position for unmoved item");

        item = { id: "id_3", position: 1 };
        newResult = getSortedItemsAfterMove.get(result, item, 3);
        resultItem = newResult[2];
        movedItem1 = newResult[0];
        movedItem2 = newResult[1];
        unmovedItem = newResult[3];
        expect(resultItem.id).toBe("id_3", "wrong result item");
        expect(resultItem.position).toBe(3, "wrong position for result item");

        expect(movedItem1.id).toBe("id_1", "wrong moved item 1");
        expect(movedItem1.position).toBe(1, "wrong position for moved item 1");

        expect(movedItem2.id).toBe("id_2", "wrong moved item 2");
        expect(movedItem2.position).toBe(2, "wrong position for moved item 2");

        expect(unmovedItem.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem.position).toBe(4, "wrong position for unmoved item");
    });

    it('should managed correctly multiple moves', function(){
        var item = { id: "id_3", position: 3 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 1);
        var resultItem = result[2];
        var movedItem1 = result[0];
        var movedItem2 = result[1];
        var unmovedItem = result[3];
        expect(resultItem.id).toBe("id_3", "wrong result item");
        expect(resultItem.position).toBe(1, "wrong position for result item");

        expect(movedItem1.id).toBe("id_1", "wrong moved item 1");
        expect(movedItem1.position).toBe(2, "wrong position for moved item 1");

        expect(movedItem2.id).toBe("id_2", "wrong moved item 2");
        expect(movedItem2.position).toBe(3, "wrong position for moved item 2");

        expect(unmovedItem.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem.position).toBe(4, "wrong position for unmoved item");

        item = { id: "id_3", position: 1 };
        newResult = getSortedItemsAfterMove.get(result, item, 2);
        resultItem = newResult[2];
        movedItem = newResult[0];
        unmovedItem1 = newResult[1];
        unmovedItem2 = newResult[3];
        expect(resultItem.id).toBe("id_3", "wrong result item");
        expect(resultItem.position).toBe(2, "wrong position for result item");

        expect(movedItem.id).toBe("id_1", "wrong moved item 1");
        expect(movedItem.position).toBe(1, "wrong position for moved item 1");

        expect(unmovedItem1.id).toBe("id_2", "wrong moved item 2");
        expect(unmovedItem1.position).toBe(3, "wrong position for moved item 2");

        expect(unmovedItem2.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem2.position).toBe(4, "wrong position for unmoved item");
    });

    it('should return correctly move down of one position ad correctly update other items position', function(){
        var item = { id: "id_2", position: 2 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 3);
        var resultItem = result[1];
        var movedItem = result[2];
        expect(resultItem.id).toBe("id_2", "wrong result item");
        expect(resultItem.position).toBe(3, "wrong position for result item");

        expect(movedItem.id).toBe("id_3", "wrong moved item");
        expect(movedItem.position).toBe(2, "wrong position for moved item");
    });

    it('should return correctly move dow of more position ad correctly update other items position', function(){
        var item = { id: "id_1", position: 1 };
        var result = getSortedItemsAfterMove.get(sortedItems, item, 3);
        var resultItem = result[0];
        var movedItem1 = result[1];
        var movedItem2 = result[2];
        var unmovedItem = result[3];
        expect(resultItem.id).toBe("id_1", "wrong result item");
        expect(resultItem.position).toBe(3, "wrong position for result item");

        expect(movedItem1.id).toBe("id_2", "wrong moved item 1");
        expect(movedItem1.position).toBe(1, "wrong position for moved item 1");

        expect(movedItem2.id).toBe("id_3", "wrong moved item 2");
        expect(movedItem2.position).toBe(2, "wrong position for moved item 2");

        expect(unmovedItem.id).toBe("id_4", "wrong unmoved item");
        expect(unmovedItem.position).toBe(4, "wrong position for unmoved item");
    });

});
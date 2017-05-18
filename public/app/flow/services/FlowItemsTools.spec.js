describe('FlowItemsTools', function(){
    var flowItemsTools;
    var oldItems;
    var newItems;

    beforeEach(function(){
        var $injector = angular.injector(['app.flow']);
        flowItemsTools = $injector.get('FlowItemsTools');
        oldItems = [
            {createdAt: "2017-04-28T14:00:00+02:00", id: "4", description: "task 4"},
            {createdAt: "2017-04-28T13:51:14+02:00", id: "3", description: "task 3"},
            {createdAt: "2017-04-28T09:49:12+02:00", id: "2", description: "task 2"},
            {createdAt: "2015-04-28T13:51:14+02:00", id: "1", description: "task 1"},
            {createdAt: "2015-04-28T13:50:14+02:00", id: "0", description: "task 0"}
        ];
    });

    it("merge function should return merged array ordered from more recent to farther not repeating already existing items", function(){
        newItems = [
            {createdAt: "2017-04-28T14:01:00+02:00", id: "otherNewItem", description: "bazz"},
            {createdAt: "2017-04-28T14:02:00+02:00", id: "newItem", description: "foo"},
            {createdAt: "2017-04-28T14:00:00+02:00", id: "4", description: "task 4"},
            {createdAt: "2017-04-28T13:51:14+02:00", id: "3", description: "task 3"}
        ];

        expect(flowItemsTools.merge(oldItems, newItems).items.length).toBe(7, "all items should be merged");
        expect(flowItemsTools.merge(oldItems, newItems).items[0].id).toBe("newItem", "first item should be first item of newItem");
        expect(flowItemsTools.merge(oldItems, newItems).items[1].id).toBe("otherNewItem", "second item should be second item of newItem");
        expect(flowItemsTools.merge(oldItems, newItems).items[2].id).toBe("4", "after newItems should be oldItems(0)");
        expect(flowItemsTools.merge(oldItems, newItems).items[3].id).toBe("3", "after newItems should be oldItems(1)");
        expect(flowItemsTools.merge(oldItems, newItems).items[4].id).toBe("2", "after newItems should be oldItems(2)");
        expect(flowItemsTools.merge(oldItems, newItems).items[5].id).toBe("1", "after newItems should be oldItems(3)");
        expect(flowItemsTools.merge(oldItems, newItems).items[6].id).toBe("0", "after newItems should be oldItems(4)");
    });

    it("merge function should not modify inputs array", function(){
        var oldItemsCopy = JSON.parse(JSON.stringify(oldItems));
        newItems = [
            {createdAt: "2017-04-28T14:01:00+02:00", id: "otherNewItem", description: "bazz"},
            {createdAt: "2017-04-28T14:02:00+02:00", id: "newItem", description: "foo"},
            {createdAt: "2017-04-28T14:00:00+02:00", id: "4", description: "task 4"},
            {createdAt: "2017-04-28T13:51:14+02:00", id: "3", description: "task 3"}
        ];
        var newItemsCopy = JSON.parse(JSON.stringify(newItems));

        flowItemsTools.merge(oldItemsCopy, newItemsCopy);
        expect(oldItemsCopy).toEqual(oldItems);
        expect(newItemsCopy).toEqual(newItems);
    });

    it("merge function should work with undefined oldItems", function(){
        newItems = [
            {id: "newItem", description: "foo"},
            {id: "otherNewItem", description: "bazz"},
            {id: "4", description: "task 4"},
            {id: "3", description: "task 3"}
        ];

        expect(flowItemsTools.merge(undefined, newItems).items.length).toBe(4);
    });

    it("objToArray function should take an obj with date and return array ordered from more recent to farther", function(){
        var obj = {
          "1": {
            "createdAt": "2015-04-28T13:51:14+02:00",
            "id": "1"
          },
          "2": {
            "createdAt": "2017-04-28T13:51:14+02:00",
            "id": "2"
          },
          "3": {
            "createdAt": "2017-04-28T14:00:00+02:00",
            "id": "3"
          },
          "4": {
            "createdAt": "2017-04-28T09:49:12+02:00",
            "id": "4"
          }
        };

        var arrFromObj = flowItemsTools.objToArray(obj);

        expect(arrFromObj[0].id).toBe("3");
        expect(arrFromObj[1].id).toBe("2");
        expect(arrFromObj[2].id).toBe("4");
        expect(arrFromObj[3].id).toBe("1");
    });

    it("objToArray function should return empty array if obj is undefined", function(){
        expect(flowItemsTools.objToArray(undefined)).toEqual([]);
    });

    it("merge function return should contain hadNewItems at false if there is no new items", function(){
        newItems = [
            {createdAt: "2017-04-28T14:00:00+02:00", id: "4", description: "task 4"},
            {createdAt: "2017-04-28T13:51:14+02:00", id: "3", description: "task 3"}
        ];

        expect(flowItemsTools.merge(oldItems, newItems).hadNewItems).toBe(false);
    });

    it("merge function return should contain hadNewItems at true if there is new items", function(){
        newItems = [
            {createdAt: "2017-04-28T14:02:00+02:00", id: "newItem", description: "foo"},
            {createdAt: "2017-04-28T14:00:00+02:00", id: "4", description: "task 4"},
            {createdAt: "2017-04-28T13:51:14+02:00", id: "3", description: "task 3"}
        ];

        expect(flowItemsTools.merge(oldItems, newItems).hadNewItems).toBe(true);
    });

});
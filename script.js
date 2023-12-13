  document.addEventListener('alpine:init', () => {
    Alpine.store('shipping', () => ({
      items: [],
      boxes: [],
      packedBoxes: [],
      message: "",

      addItem: function (name, width, height, length) {
        if (!name || !width || !height || !length) {
          return;
        }
        
        this.items.push({name, width, height, length});
        this.recalculate();
      },

      deleteItem: function (i) {
        this.items.splice(i, 1);
        this.recalculate();
      },

      addBox: function (name, width, height, length) {
        if (!name || !width || !height || !length) {
          return;
        }
        this.boxes.push({name, width, height, length});
        this.recalculate();
      },

      deleteBox: function (i) {
        this.boxes.splice(i, 1);
        this.recalculate();
      },

      recalculate: function () {
        if (!this.items.length || !this.boxes.length) {
          this.packedBoxes = [];

          return;
        }

        this.packedBoxes = packItemsIntoBoxes(this.items, this.boxes);

        console.log(this.packedBoxes);
      }
    }));
  })

  function packItemsIntoBoxes(items, boxes) {
    // Sort items by volume big to small
    items.sort((a, b) => calculateVolume(a) - calculateVolume(b));

    // Sort boxes by volume small to big
    boxes.sort((a, b) => calculateVolume(b) - calculateVolume(a));

    // Array to hold the result
    let packedBoxes = [];

    // Iterate over each item
    for (let item of items) {
      let itemPacked = false;

      // Try to fit the item in an already used box
      for (let box of packedBoxes) {
        if (doesItemFit(item, box)) {
          box.items.push(item);
          itemPacked = true;
          break;
        }
      }

      // If the item did not fit in any used box, try to fit it in a new box
      if (!itemPacked) {
        for (let box of boxes) {
          if (doesItemFit(item, box)) {
            let newBox = {...box, items: [item]};
            packedBoxes.push(newBox);
            itemPacked = true;
            break;
          }
        }
      }

      // If the item did not fit in ANY box, assume using the largest possible box
      if (!itemPacked) {
        let newBox = {...boxes.slice(-1)[0], items: [item]};
        packedBoxes.push(newBox);
      }
    }

    return packedBoxes;
  }

  // Function to calculate the volume of an item or box
  function calculateVolume(obj) {
    return obj.width * obj.height * obj.length;
  }

  // Check if an item fits in the remaining volume of a box
  function doesItemFit(item, box) {
    let totalVolume = calculateVolume(box);
    let usedVolume = 0;

    const items = box.items ?? []

    // Calculate the volume used by items already in the box
    for (let packedItem of items) {
      usedVolume += calculateVolume(packedItem);
    }

    // Check if the item fits in the remaining volume
    return calculateVolume(item) <= (totalVolume - usedVolume);
  }

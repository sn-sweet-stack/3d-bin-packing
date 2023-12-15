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
    items.sort((a, b) => calculateVolume(b) - calculateVolume(a));

    // Sort boxes by volume small to big
    boxes.sort((a, b) => calculateVolume(a) - calculateVolume(b));

    // Calculate total volume of all items
    const totalItemsVolume = items.reduce((total, item) => total + calculateVolume(item), 0);

    // Find the smallest box where all items can potentially fit
    let suitableBox = boxes.find(box => calculateVolume(box) >= totalItemsVolume);

    // If all items fit into one box
    if (suitableBox) {
        return [{ ...suitableBox, items: [...items] }];
    }

    // Otherwise, use the largest box available just once
    let box = { ...boxes[boxes.length - 1], items: [] };
    let remainingBoxVolume = calculateVolume(box);
    let remainingItems = [];

    // Try to pack as many items as possible into the current box
    items.forEach(item => {
        let itemVolume = calculateVolume(item);
        // if the item is bigger than the largest box, we don't have a choice but to place it into the box anyway, but only if it's empty
        if (itemVolume <= remainingBoxVolume || !boxes.items.length) {
            box.items.push(item);
            remainingBoxVolume -= itemVolume;
        } else {
            remainingItems.push(item);
        }
    });

    // Pack the remaining items recursively
    let packedBoxes = [box];
    if (remainingItems.length > 0) {
        packedBoxes = packedBoxes.concat(packItemsIntoBoxes(remainingItems, boxes));
    }

    return packedBoxes;
  }

  // Function to calculate the volume of an item or box
  function calculateVolume(obj) {
    return obj.width * obj.height * obj.length;
  }

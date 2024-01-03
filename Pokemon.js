class Pokemon{
    name = "";
    id = 0;
    nativeRegion = "";
    inDex = "";
    caught = false;
    available = "";

    constructor(name, id, nativeRegion, inDex, caught, available, sprite){
      this.name = name;
      this.id = id;
      this.nativeRegion = nativeRegion;
      this.inDex = inDex;
      this.caught = caught;
      this.available = available;
      this.sprite = sprite;
    }
}

module.exports = Pokemon;
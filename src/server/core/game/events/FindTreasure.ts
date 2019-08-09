import { Event, EventName } from './Event';
import { Player } from '../../../../shared/models/entity';
import { Item } from '../../../../shared/models';
import { ItemClass, AdventureLogEventType } from '../../../../shared/interfaces';

export class FindTreasure extends Event {
  public static readonly WEIGHT = 0;

  public operateOn(player: Player, opts: any = { treasureName: '' }) {

    player.increaseStatistic('Treasure/Total/Touch', 1);

    const curTimer = player.cooldowns[opts.treasureName];
    if(Date.now() < curTimer) {
      player.increaseStatistic('Treasure/Total/Empty', 1);
      this.emitMessage([player],
        `You could not loot ${opts.treasureName} because it was empty! Check back at ${new Date(curTimer)}.`,
        AdventureLogEventType.Explore);
      return;
    }

    // 30 minute cooldown
    player.cooldowns[opts.treasureName] = Date.now() + (30 * 60 * 1000);

    const { chests, items } = this.assetManager.allTreasureAssets;

    player.increaseStatistic(`Treasure/Chest/${opts.treasureName}`, 1);

    const treasureItems = chests[opts.treasureName].items;
    const allItemInstances = treasureItems.map(itemName => {
      const item = new Item();
      const baseItem = items[itemName];
      baseItem.name = itemName;
      baseItem.itemClass = ItemClass.Guardian;
      item.init(baseItem);
      return item;
    });

    allItemInstances.forEach(item => {
      player.increaseStatistic('Treasure/Total/ItemsFound', 1);
      player.$$game.eventManager.doEventFor(player, EventName.FindItem, { fromChest: true, item: item });
    });
  }
}

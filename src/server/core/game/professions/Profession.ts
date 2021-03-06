
import { Stat } from '../../../../shared/interfaces/Stat';
import { IProfession, ICharacter, IAttribute, IAffinity, Channel, AdventureLogEventType } from '../../../../shared/interfaces';

export class BaseAttribute implements IAttribute {
  public readonly oocAbilityName: string;
  public readonly oocAbilityDesc: string;
  public readonly oocAbilityCost: number;

  public get $professionData() {
    return {
      oocAbilityDesc: this.oocAbilityDesc,
      oocAbilityName: this.oocAbilityName,
      oocAbilityCost: this.oocAbilityCost
    };
  }

  public oocAbility(player: ICharacter): { success: boolean, message: string } {
    return { success: true, message: '' };
  }
}

export class BaseAffinity implements IAffinity {

  public readonly specialStatName: string;

  public readonly statForStats: { [key in Stat]?: { [key2 in Stat]?: number } } = {
    [Stat.HP]: {
      [Stat.CON]: 1
    }
  };

  public readonly statMultipliers: { [key in Stat]?: number } = {
    [Stat.HP]:  1,
    [Stat.STR]: 1,
    [Stat.DEX]: 1,
    [Stat.INT]: 1,
    [Stat.CON]: 1,
    [Stat.AGI]: 1,
    [Stat.LUK]: 1,

    [Stat.SPECIAL]:  0,

    [Stat.XP]:   1,
    [Stat.GOLD]: 1
  };

  public readonly statsPerLevel: { [key in Stat]?: number } = {
    [Stat.HP]:  10,
    [Stat.STR]: 1,
    [Stat.DEX]: 1,
    [Stat.INT]: 1,
    [Stat.CON]: 1,
    [Stat.AGI]: 1,
    [Stat.LUK]: 1,

    [Stat.SPECIAL]:  0,

    [Stat.XP]:   0,
    [Stat.GOLD]: 0
  };

  public calcLevelStat(playerLevel: number, stat: Stat) {
    return playerLevel * (this.statsPerLevel[stat] || 0);
  }

  public calcStatMultiplier(stat: Stat) {
    return (this.statMultipliers[stat] || 1);
  }

  public calcStatsForStats(stats: { [key in Stat]: number }, chosenStat: Stat): Array<{ stat: Stat, boost: number, tinyBoost: number }> {
    const baseBoosts = this.statForStats[chosenStat];
    if(!baseBoosts) return [];

    return Object.keys(baseBoosts).map((boostedStat: Stat) => {
      return {
        stat: boostedStat,
        boost: stats[boostedStat] * (baseBoosts[boostedStat] || 1),
        tinyBoost: baseBoosts[boostedStat]
      };
    });
  }
}

export class BaseProfession extends BaseAffinity implements IAffinity, IAttribute, IProfession {

  public readonly oocAbilityName: string;
  public readonly oocAbilityDesc: string;
  public readonly oocAbilityCost: number;

  public get $professionData() {
    return {
      oocAbilityDesc: this.oocAbilityDesc,
      oocAbilityName: this.oocAbilityName,
      oocAbilityCost: this.oocAbilityCost
    };
  }

  public oocAbility(player: ICharacter): { success: boolean; message: string } {
    return { success: true, message: '' };
  }

  public determineStartingSpecial(player: ICharacter): number {
    return player.getStat(Stat.SPECIAL);
  }

  public determineMaxSpecial(player: ICharacter): number {
    return player.getStat(Stat.SPECIAL);
  }

  protected emitProfessionMessage(player: ICharacter, message: string) {
    (player as any).$$game.subscriptionManager.emitToChannel(Channel.PlayerAdventureLog, { playerNames: [player.name], data: {
      when: Date.now(),
      type: AdventureLogEventType.Profession,
      message
    } });
  }

}

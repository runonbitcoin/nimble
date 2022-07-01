const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { verifyTx } = nimble.functions

describe('verifyTx', () => {
  it('verifies p2pkh tx', () => {
    // 10d1f4ee4e145abf04a2a70a3c17f429e3b9341edf4e32ba7082b3325c2187c9
    const hex =
      '0100000001b207aba3f19358f3a58048d7647cff2ca25a57fe92a1c4324ba47fdde7d7eca4030000006a4730440220316f5707b0a872c67bebc10f15832389c96a6be58e803c992d6b4b3bc5864687022019cf6ab02706865b8507a4f56eeae155ac794a363d95dce8c8777c10f1f9fc01412103093313584be3ccd8777947c1b8f9cc945e9764296451aa29209f9ac56eb4e91affffffff03204e0000000000001976a91461ed573d90e9582689739e72d17624b2d8faa4c388ac204e0000000000001976a914fca1fe054916c043dc36d703a464cb6edce8e72e88ac5b0c6e01000000001976a91400937c46183f418f8eaac2af10db62c5c852ffe888ac00000000'

    // a4ecd7e7dd7fa44b32c4a192fe575aa22cff7c64d74880a5f35893f1a3ab07b2
    const prevhex =
      '01000000014b71d4aa217e6e515f343c1b5f3e6294fd416e8fa782b089a412c6e32ad0ed07050000006a4730440220449b66c7ec56b6e6f4c133e3cce67cb74e97bbc924deb3f4dbf43e3de941d05e0220649510d81de69df1bbef6b627dab88e20fa272a811613f97503c45715146c929412103a8ff752878232a096647f90350851419daca06a498f382de8b89772930ad4727ffffffff0450c30000000000001976a914902bfe624e2620a4615e7bb6511abd2c2fc7ff7d88ac204e0000000000001976a9149e2f22092ab09053c8be4a662045c069205a511588ac10270000000000001976a914eec1eda286b8fd1a198b6f6ee103bd24d3cdbd5188ac37a96e01000000001976a9149595b9d204ca44fde3b4fb43eff8e8b9d74edd8a88ac00000000'

    const tx = nimble.Transaction.fromString(hex)
    const prevtx = nimble.Transaction.fromString(prevhex)

    const minFeePerKb = 50
    const parents = [prevtx.outputs[3]]

    verifyTx(tx, parents, minFeePerKb)
  })

  it('verifies op_push_tx tx', () => {
    // 6b48a034eebf2dcca5c0c61dbb8407a4d3dc747786563fb7f46bae677a941778
    const hex =
      '0100000002cad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda45782203000000fdb4034daf030100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda45782203000000fd100320aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a756177777777778705000000000000ffffffffaaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c700000000c30000000000ffffffffcad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda457822040000006a473044022049624f444425d53d9465088fe5239ac0e3f36a68c51ea0faeded2accc5f67464022037f203a2ae519af1deb5bad9a2eaada5878157f589a166188bbe505feb8d5c664121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff04d0070000000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac0000000000000000fdc901006a0372756e0105004dbd017b22696e223a312c22726566223a5b22326534376165323832656135366465306234613161386132623439643330623364663863366636386230656662323036313363343331363761616562306635305f6f31222c22373261363165623939306666646236623338653566393535653139346665643566663662303134663735616336383233353339636535363133616561306265385f6f31225d2c226f7574223a5b2237336432353434666465396338343230316630653766376330373232366464316439343262343665626562633732653662633863323032316633353564646161225d2c2264656c223a5b2261373234623162663762623065643235313431313933326233666333396631653237373262326538306239383931383762653739663930373935326636383032225d2c22637265223a5b223137643952503733467579503565443154756e7a7952777652465a63644431366233225d2c2265786563223a5b7b226f70223a2243414c4c222c2264617461223a5b7b22246a6967223a307d2c2273656e64222c5b223137643952503733467579503565443154756e7a7952777652465a63644431366233222c323030305d5d7d5d7d11010000000000001976a91448a6c21f7b62fb917ee09ee18537a878605921f388acb1b40b00000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac00000000'

    // 227845da8e77969a3c8c888f1aa7ce193c7e94d146c5fdf9a4b078a1c457d6ca
    const prevhex =
      '010000000364974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227020000006a47304402201dc7ba571d4c668303fc67ebcda250291e3dc589f9e9a26da82c39cdb1e7c7390220434fc4273a3028a5a6f6f266d875a7a1a154c90a315949cad46caa2096d2d6bb412102e0163c5d3a7320384bd4b47a9a33f9f52bfc975ae625e16bcced732d89e5d48affffffff64974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227000000006a47304402203d038ce0fde27bab0d31e596bf8e98a70c0a57714b7e54fba87d65ebea13b358022008d1583a727300383d03d6b5c222563815ef624171062affece7bbd30eab1d1a4121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff64974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227040000006b483045022100bb2e7ee1e6c2ac89520688693cbf70c814c9ebd47e511d1f1248856926e37593022010b7c2af433ff0e3dfb2ded1300939f9c70677529bfd5f1952eb5957c4edbe7a4121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff0522020000000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac0000000000000000fd9003006a0372756e0105004d84037b22696e223a312c22726566223a5b22643631373030323561363232343864386466366463313465333830366536386238646633643830346338303063376266623233623062343233323836323530355f6f31222c22326534376165323832656135366465306234613161386132623439643330623364663863366636386230656662323036313363343331363761616562306635305f6f31222c22373261363165623939306666646236623338653566393535653139346665643566663662303134663735616336383233353339636535363133616561306265385f6f31222c22373237653762343233623765653430633062356265383766626137666135363733656132643230613734323539303430613732393564396333326139303031315f6f31222c22383162636566323962306534656437343566333432326330623736346133336337366430333638616632643265376464313339646238653030656533643861365f6f31222c22343931343536393336373661663735363765626532303637316335636230313336396163373838633230663362316338303466363234613165646131386633665f6f31222c22336237656634313131383562626533643031636165616462653666313135623031303361353436633465663061633734373461613666626237316166663230385f6f31225d2c226f7574223a5b2231613731363232383763653036336562356533333737306431373564313637643539323638633766336563393261643366643066316430346161626565303234222c2265653738633230356636313132353936656439623563336663393766353739313734653863303539633431353731653132636639336535336637366532613030225d2c2264656c223a5b5d2c22637265223a5b7b2224617262223a7b2261646472657373223a22314c566d536e76536561386166445150414251567a6e664470775a7245616e736e7a222c227361746f73686973223a323030307d2c2254223a7b22246a6967223a317d7d5d2c2265786563223a5b7b226f70223a2243414c4c222c2264617461223a5b7b22246a6967223a307d2c2273656e64222c5b7b2224617262223a7b2261646472657373223a22314c566d536e76536561386166445150414251567a6e664470775a7245616e736e7a222c227361746f73686973223a323030307d2c2254223a7b22246a6967223a317d7d2c323030305d5d7d5d7d11010000000000001976a9147d84ef033a83de99f901583153832ac11819c73d88ac8705000000000000fd100320aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561777777777787ba0b00000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac00000000'

    const tx = nimble.Transaction.fromString(hex)
    const prevtx = nimble.Transaction.fromString(prevhex)

    const minFeePerKb = 50
    const parents = [prevtx.outputs[3], prevtx.outputs[4]]

    verifyTx(tx, parents, minFeePerKb)
  })

  it('throws if bad version', () => {
    expect(() => verifyTx({ version: 2 })).to.throw('bad version')
    expect(() => verifyTx({ version: 0 })).to.throw('bad version')
  })

  it('throws if bad locktime', () => {
    expect(() => verifyTx({ locktime: -1 })).to.throw('bad locktime')
    expect(() => verifyTx({ locktime: 0xffffffff + 1 })).to.throw(
      'bad locktime'
    )
    expect(() => verifyTx({ locktime: 1.5 })).to.throw('bad locktime')
  })

  it('throws if no inputs', () => {
    expect(() => verifyTx({ inputs: [] })).to.throw('no inputs')
  })

  it('throws if no outputs', () => {
    const input = { txid: new nimble.Transaction().hash, vout: 0 }
    expect(() => verifyTx({ inputs: [input], outputs: [] })).to.throw(
      'no outputs'
    )
  })

  it('throws if insufficient fees', () => {
    const input = { txid: new nimble.Transaction().hash, vout: 0 }
    const output = { script: [], satoshis: 1000 }
    const parents = [{ satoshis: 1000 }]
    expect(() =>
      verifyTx({ inputs: [input], outputs: [output] }, parents, 50)
    ).to.throw('insufficient priority')
  })

  it('throws if duplicate input', () => {
    const input = { txid: new nimble.Transaction().hash, vout: 0 }
    const output = { script: [], satoshis: 1000 }
    const parents = [{ satoshis: 1000 }, { satoshis: 1000 }]
    expect(() =>
      verifyTx({ inputs: [input, input], outputs: [output] }, parents, 50)
    ).to.throw('duplicate input')
  })
})

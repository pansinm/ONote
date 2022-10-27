import * as monaco from 'monaco-editor';
/** @eslint-ignore */

export const typewords = [
  'abstract',
  'actor',
  'agent',
  'archimate',
  'artifact',
  'boundary',
  'card',
  'class',
  'cloud',
  'component',
  'control',
  'database',
  'diamond',
  'entity',
  'enum',
  'file',
  'folder',
  'frame',
  'interface',
  'node',
  'object',
  'package',
  'participant',
  'queue',
  'rectangle',
  'stack',
  'state',
  'storage',
  'usecase',
];
export const keywords = [
  '@enddot',
  '@endsalt',
  '@enduml',
  '@startdot',
  '@startsalt',
  '@startuml',
  'activate',
  'again',
  'allow_mixing',
  'allowmixing',
  'also',
  'alt',
  'as',
  'autonumber',
  'bold',
  'bottom',
  'box',
  'break',
  'caption',
  'center',
  'circle',
  'create',
  'critical',
  'deactivate',
  'description',
  'destroy',
  'down',
  'else',
  'elseif',
  'empty',
  'end',
  'endif',
  'endwhile',
  'false',
  'footbox',
  'footer',
  'fork',
  'group',
  'header',
  'hide',
  'hnote',
  'if',
  'is',
  'italic',
  'kill',
  'left',
  'legend',
  'link',
  'loop',
  'members',
  'namespace',
  'newpage',
  'note',
  'of',
  'on',
  'opt',
  'order',
  'over',
  'package',
  'page',
  'par',
  'partition',
  'plain',
  'ref',
  'repeat',
  'return',
  'right',
  'rnote',
  'rotate',
  'show',
  'skin',
  'skinparam',
  'start',
  'stop',
  'strictuml',
  'title',
  'top',
  'top to bottom direction',
  'true',
  'up',
  'while',
];
export const preprocessor = [
  '!define',
  '!definelong',
  '!else',
  '!enddefinelong',
  '!endif',
  '!exit',
  '!if',
  '!ifdef',
  '!ifndef',
  '!include',
  '!pragma',
  '!undef',
  '!while',
  '!endwhile',
  '!foreach',
  '!endfor',
  '!theme',
];

export const allkeywords = typewords.concat(keywords);
// const skinparameter = ["ActivityBackgroundColor", "ActivityBarColor", "ActivityBorderColor", "ActivityBorderThickness", "ActivityDiamondBackgroundColor", "ActivityDiamondBorderColor", "ActivityDiamondFontColor", "ActivityDiamondFontName", "ActivityDiamondFontSize", "ActivityDiamondFontStyle", "ActivityEndColor", "ActivityFontColor", "ActivityFontName", "ActivityFontSize", "ActivityFontStyle", "ActivityStartColor", "ActorBackgroundColor", "ActorBorderColor", "ActorFontColor", "ActorFontName", "ActorFontSize", "ActorFontStyle", "ActorStereotypeFontColor", "ActorStereotypeFontName", "ActorStereotypeFontSize", "ActorStereotypeFontStyle", "AgentBackgroundColor", "AgentBorderColor", "AgentBorderThickness", "AgentFontColor", "AgentFontName", "AgentFontSize", "AgentFontStyle", "AgentStereotypeFontColor", "AgentStereotypeFontName", "AgentStereotypeFontSize", "AgentStereotypeFontStyle", "ArrowColor", "ArrowFontColor", "ArrowFontName", "ArrowFontSize", "ArrowFontStyle", "ArrowLollipopColor", "ArrowMessageAlignment", "ArrowThickness", "ArtifactBackgroundColor", "ArtifactBorderColor", "ArtifactFontColor", "ArtifactFontName", "ArtifactFontSize", "ArtifactFontStyle", "ArtifactStereotypeFontColor", "ArtifactStereotypeFontName", "ArtifactStereotypeFontSize", "ArtifactStereotypeFontStyle", "BackgroundColor", "BiddableBackgroundColor", "BiddableBorderColor", "BoundaryBackgroundColor", "BoundaryBorderColor", "BoundaryFontColor", "BoundaryFontName", "BoundaryFontSize", "BoundaryFontStyle", "BoundaryStereotypeFontColor", "BoundaryStereotypeFontName", "BoundaryStereotypeFontSize", "BoundaryStereotypeFontStyle", "BoxPadding", "CaptionFontColor", "CaptionFontName", "CaptionFontSize", "CaptionFontStyle", "CardBackgroundColor", "CardBorderColor", "CardBorderThickness", "CardFontColor", "CardFontName", "CardFontSize", "CardFontStyle", "CardStereotypeFontColor", "CardStereotypeFontName", "CardStereotypeFontSize", "CardStereotypeFontStyle", "CircledCharacterFontColor", "CircledCharacterFontName", "CircledCharacterFontSize", "CircledCharacterFontStyle", "CircledCharacterRadius", "ClassAttributeFontColor", "ClassAttributeFontName", "ClassAttributeFontSize", "ClassAttributeFontStyle", "ClassAttributeIconSize", "ClassBackgroundColor", "ClassBorderColor", "ClassBorderThickness", "ClassFontColor", "ClassFontName", "ClassFontSize", "ClassFontStyle", "ClassHeaderBackgroundColor", "ClassStereotypeFontColor", "ClassStereotypeFontName", "ClassStereotypeFontSize", "ClassStereotypeFontStyle", "CloudBackgroundColor", "CloudBorderColor", "CloudFontColor", "CloudFontName", "CloudFontSize", "CloudFontStyle", "CloudStereotypeFontColor", "CloudStereotypeFontName", "CloudStereotypeFontSize", "CloudStereotypeFontStyle", "CollectionsBackgroundColor", "CollectionsBorderColor", "ColorArrowSeparationSpace", "ComponentBackgroundColor", "ComponentBorderColor", "ComponentBorderThickness", "ComponentFontColor", "ComponentFontName", "ComponentFontSize", "ComponentFontStyle", "ComponentStereotypeFontColor", "ComponentStereotypeFontName", "ComponentStereotypeFontSize", "ComponentStereotypeFontStyle", "ComponentStyle", "ConditionStyle", "ControlBackgroundColor", "ControlBorderColor", "ControlFontColor", "ControlFontName", "ControlFontSize", "ControlFontStyle", "ControlStereotypeFontColor", "ControlStereotypeFontName", "ControlStereotypeFontSize", "ControlStereotypeFontStyle", "DatabaseBackgroundColor", "DatabaseBorderColor", "DatabaseFontColor", "DatabaseFontName", "DatabaseFontSize", "DatabaseFontStyle", "DatabaseStereotypeFontColor", "DatabaseStereotypeFontName", "DatabaseStereotypeFontSize", "DatabaseStereotypeFontStyle", "DefaultFontColor", "DefaultFontName", "DefaultFontSize", "DefaultFontStyle", "DefaultMonospacedFontName", "DefaultTextAlignment", "DesignedBackgroundColor", "DesignedBorderColor", "DesignedDomainBorderThickness", "DesignedDomainFontColor", "DesignedDomainFontName", "DesignedDomainFontSize", "DesignedDomainFontStyle", "DesignedDomainStereotypeFontColor", "DesignedDomainStereotypeFontName", "DesignedDomainStereotypeFontSize", "DesignedDomainStereotypeFontStyle", "DiagramBorderColor", "DiagramBorderThickness", "DomainBackgroundColor", "DomainBorderColor", "DomainBorderThickness", "DomainFontColor", "DomainFontName", "DomainFontSize", "DomainFontStyle", "DomainStereotypeFontColor", "DomainStereotypeFontName", "DomainStereotypeFontSize", "DomainStereotypeFontStyle", "Dpi", "EntityBackgroundColor", "EntityBorderColor", "EntityFontColor", "EntityFontName", "EntityFontSize", "EntityFontStyle", "EntityStereotypeFontColor", "EntityStereotypeFontName", "EntityStereotypeFontSize", "EntityStereotypeFontStyle", "FileBackgroundColor", "FileBorderColor", "FileFontColor", "FileFontName", "FileFontSize", "FileFontStyle", "FileStereotypeFontColor", "FileStereotypeFontName", "FileStereotypeFontSize", "FileStereotypeFontStyle", "FolderBackgroundColor", "FolderBorderColor", "FolderFontColor", "FolderFontName", "FolderFontSize", "FolderFontStyle", "FolderStereotypeFontColor", "FolderStereotypeFontName", "FolderStereotypeFontSize", "FolderStereotypeFontStyle", "FooterFontColor", "FooterFontName", "FooterFontSize", "FooterFontStyle", "FrameBackgroundColor", "FrameBorderColor", "FrameFontColor", "FrameFontName", "FrameFontSize", "FrameFontStyle", "FrameStereotypeFontColor", "FrameStereotypeFontName", "FrameStereotypeFontSize", "FrameStereotypeFontStyle", "GenericDisplay", "Guillemet", "Handwritten", "HeaderFontColor", "HeaderFontName", "HeaderFontSize", "HeaderFontStyle", "HyperlinkColor", "HyperlinkUnderline", "IconIEMandatoryColor", "IconPackageBackgroundColor", "IconPackageColor", "IconPrivateBackgroundColor", "IconPrivateColor", "IconProtectedBackgroundColor", "IconProtectedColor", "IconPublicBackgroundColor", "IconPublicColor", "InterfaceBackgroundColor", "InterfaceBorderColor", "InterfaceFontColor", "InterfaceFontName", "InterfaceFontSize", "InterfaceFontStyle", "InterfaceStereotypeFontColor", "InterfaceStereotypeFontName", "InterfaceStereotypeFontSize", "InterfaceStereotypeFontStyle", "LegendBackgroundColor", "LegendBorderColor", "LegendBorderThickness", "LegendFontColor", "LegendFontName", "LegendFontSize", "LegendFontStyle", "LexicalBackgroundColor", "LexicalBorderColor", "Linetype", "MachineBackgroundColor", "MachineBorderColor", "MachineBorderThickness", "MachineFontColor", "MachineFontName", "MachineFontSize", "MachineFontStyle", "MachineStereotypeFontColor", "MachineStereotypeFontName", "MachineStereotypeFontSize", "MachineStereotypeFontStyle", "MaxAsciiMessageLength", "MaxMessageSize", "MinClassWidth", "Monochrome", "NodeBackgroundColor", "NodeBorderColor", "NodeFontColor", "NodeFontName", "NodeFontSize", "NodeFontStyle", "NodeStereotypeFontColor", "NodeStereotypeFontName", "NodeStereotypeFontSize", "NodeStereotypeFontStyle", "Nodesep", "NoteBackgroundColor", "NoteBorderColor", "NoteBorderThickness", "NoteFontColor", "NoteFontName", "NoteFontSize", "NoteFontStyle", "NoteShadowing", "NoteTextAlignment", "ObjectAttributeFontColor", "ObjectAttributeFontName", "ObjectAttributeFontSize", "ObjectAttributeFontStyle", "ObjectBackgroundColor", "ObjectBorderColor", "ObjectBorderThickness", "ObjectFontColor", "ObjectFontName", "ObjectFontSize", "ObjectFontStyle", "ObjectStereotypeFontColor", "ObjectStereotypeFontName", "ObjectStereotypeFontSize", "ObjectStereotypeFontStyle", "PackageBackgroundColor", "PackageBorderColor", "PackageBorderThickness", "PackageFontColor", "PackageFontName", "PackageFontSize", "PackageFontStyle", "PackageStereotypeFontColor", "PackageStereotypeFontName", "PackageStereotypeFontSize", "PackageStereotypeFontStyle", "PackageStyle", "PackageTitleAlignment", "Padding", "PageBorderColor", "PageExternalColor", "PageMargin", "ParticipantBackgroundColor", "ParticipantBorderColor", "ParticipantFontColor", "ParticipantFontName", "ParticipantFontSize", "ParticipantFontStyle", "ParticipantPadding", "PartitionBackgroundColor", "PartitionBorderColor", "PartitionBorderThickness", "PartitionFontColor", "PartitionFontName", "PartitionFontSize", "PartitionFontStyle", "PathHoverColor", "QueueBackgroundColor", "QueueBorderColor", "QueueFontColor", "QueueFontName", "QueueFontSize", "QueueFontStyle", "QueueStereotypeFontColor", "QueueStereotypeFontName", "QueueStereotypeFontSize", "QueueStereotypeFontStyle", "Ranksep", "RectangleBackgroundColor", "RectangleBorderColor", "RectangleBorderThickness", "RectangleFontColor", "RectangleFontName", "RectangleFontSize", "RectangleFontStyle", "RectangleStereotypeFontColor", "RectangleStereotypeFontName", "RectangleStereotypeFontSize", "RectangleStereotypeFontStyle", "RequirementBackgroundColor", "RequirementBorderColor", "RequirementBorderThickness", "RequirementFontColor", "RequirementFontName", "RequirementFontSize", "RequirementFontStyle", "RequirementStereotypeFontColor", "RequirementStereotypeFontName", "RequirementStereotypeFontSize", "RequirementStereotypeFontStyle", "ResponseMessageBelowArrow", "RoundCorner", "SameClassWidth", "SequenceActorBorderThickness", "SequenceArrowThickness", "SequenceBoxBackgroundColor", "SequenceBoxBorderColor", "SequenceBoxFontColor", "SequenceBoxFontName", "SequenceBoxFontSize", "SequenceBoxFontStyle", "SequenceDelayFontColor", "SequenceDelayFontName", "SequenceDelayFontSize", "SequenceDelayFontStyle", "SequenceDividerBackgroundColor", "SequenceDividerBorderColor", "SequenceDividerBorderThickness", "SequenceDividerFontColor", "SequenceDividerFontName", "SequenceDividerFontSize", "SequenceDividerFontStyle", "SequenceGroupBackgroundColor", "SequenceGroupBodyBackgroundColor", "SequenceGroupBorderColor", "SequenceGroupBorderThickness", "SequenceGroupFontColor", "SequenceGroupFontName", "SequenceGroupFontSize", "SequenceGroupFontStyle", "SequenceGroupHeaderFontColor", "SequenceGroupHeaderFontName", "SequenceGroupHeaderFontSize", "SequenceGroupHeaderFontStyle", "SequenceLifeLineBackgroundColor", "SequenceLifeLineBorderColor", "SequenceLifeLineBorderThickness", "SequenceMessageAlignment", "SequenceMessageTextAlignment", "SequenceNewpageSeparatorColor", "SequenceParticipant", "SequenceParticipantBorderThickness", "SequenceReferenceAlignment", "SequenceReferenceBackgroundColor", "SequenceReferenceBorderColor", "SequenceReferenceBorderThickness", "SequenceReferenceFontColor", "SequenceReferenceFontName", "SequenceReferenceFontSize", "SequenceReferenceFontStyle", "SequenceReferenceHeaderBackgroundColor", "SequenceStereotypeFontColor", "SequenceStereotypeFontName", "SequenceStereotypeFontSize", "SequenceStereotypeFontStyle", "SequenceTitleFontColor", "SequenceTitleFontName", "SequenceTitleFontSize", "SequenceTitleFontStyle", "Shadowing", "StackBackgroundColor", "StackBorderColor", "StackFontColor", "StackFontName", "StackFontSize", "StackFontStyle", "StackStereotypeFontColor", "StackStereotypeFontName", "StackStereotypeFontSize", "StackStereotypeFontStyle", "StateAttributeFontColor", "StateAttributeFontName", "StateAttributeFontSize", "StateAttributeFontStyle", "StateBackgroundColor", "StateBorderColor", "StateEndColor", "StateFontColor", "StateFontName", "StateFontSize", "StateFontStyle", "StateStartColor", "StereotypeABackgroundColor", "StereotypeABorderColor", "StereotypeCBackgroundColor", "StereotypeCBorderColor", "StereotypeEBackgroundColor", "StereotypeEBorderColor", "StereotypeIBackgroundColor", "StereotypeIBorderColor", "StereotypeNBackgroundColor", "StereotypeNBorderColor", "StereotypePosition", "StorageBackgroundColor", "StorageBorderColor", "StorageFontColor", "StorageFontName", "StorageFontSize", "StorageFontStyle", "StorageStereotypeFontColor", "StorageStereotypeFontName", "StorageStereotypeFontSize", "StorageStereotypeFontStyle", "Style", "SvglinkTarget", "SwimlaneBorderColor", "SwimlaneBorderThickness", "SwimlaneTitleFontColor", "SwimlaneTitleFontName", "SwimlaneTitleFontSize", "SwimlaneTitleFontStyle", "SwimlaneWidth", "SwimlaneWrapTitleWidth", "TabSize", "TitleBackgroundColor", "TitleBorderColor", "TitleBorderRoundCorner", "TitleBorderThickness", "TitleFontColor", "TitleFontName", "TitleFontSize", "TitleFontStyle", "UsecaseBackgroundColor", "UsecaseBorderColor", "UsecaseBorderThickness", "UsecaseFontColor", "UsecaseFontName", "UsecaseFontSize", "UsecaseFontStyle", "UsecaseStereotypeFontColor", "UsecaseStereotypeFontName", "UsecaseStereotypeFontSize", "UsecaseStereotypeFontStyle", "WrapWidth"];
// const colors = ["APPLICATION", "AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "BUSINESS", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkGrey", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "Darkorange", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Green", "GreenYellow", "Grey", "HoneyDew", "HotPink", "IMPLEMENTATION", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGreen", "LightGrey", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "MOTIVATION", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PHYSICAL", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "STRATEGY", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "TECHNOLOGY", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];

monaco.languages.register({
  id: 'plantuml',
  filenamePatterns: ['\\.(puml|plantuml)(\\.svg)?$'],
  aliases: ['puml'],
});

monaco.languages.setMonarchTokensProvider('plantuml', {
  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',

  keywords: keywords,

  typeKeywords: typewords,

  preprocessor: preprocessor,

  operators: ['<-->'],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*/^%]+/,

  // C# style strings
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      [/@{1}start(.+)/, 'annotation'],
      [/@{1}end(.+)/, 'annotation'],
      [/![a-zA-Z]+/, { cases: { '@preprocessor': 'keyword' } }],
      // identifiers and keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@typeKeywords': 'keyword',
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
      [/[A-Z][\w$]*/, 'identifier'], // to show class names nicely

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'keyword', '@default': '' } }],

      // numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/'/, { token: 'comment', bracket: '@open', next: '@comment' }],
      [/'.*$/, 'comment'],
    ],

    comment: [
      [/'\//, { token: 'comment', bracket: '@close', next: '@pop' }],
      [/.+/, 'comment'],
    ],
  },
} as any);

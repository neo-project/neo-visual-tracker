using System.Numerics;

using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services.Neo;

[assembly: ContractTitle("MyTestContract")]
[assembly: ContractDescription("This is the description of my contract")]
[assembly: ContractVersion("2.0")]
[assembly: ContractAuthor("Some Author")]
[assembly: ContractEmail("someone@somewhere.invalid")]
[assembly: Features(ContractPropertyState.HasStorage)]
public class TestContract : SmartContract
{
    public static object Main(string method, object[] args)
    {
        if (method == "PutNumber") 
        {
            PutNumber((BigInteger) args[0]);
            return args[0];
        } 
        else if (method == "GetNumber")
        {
            return GetNumber();
        }
        else if (method == "PutString") 
        {
            PutString((string) args[0]);
            return args[0];
        } 
        else if (method == "GetString")
        {
            return GetString();
        }
        else if (method == "PutMapValue") 
        {
            PutMapValue((string) args[0], (string) args[1]);
            return args[1];
        } 
        else if (method == "GetMapValue")
        {
            return GetMapValue((string) args[0]);
        }
        else if (method == "PutData") 
        {
            PutData((byte[]) args[0]);
            return args[0];
        } 
        else if (method == "GetData")
        {
            return GetData();
        }
        else
        {
            return 0;
        }
    }

    public static void PutNumber(BigInteger n)
    {
        Storage.Put(Storage.CurrentContext, "Number", n);
    }

    public static byte[] GetNumber()
    {
        return Storage.Get(Storage.CurrentContext, "Number");
    }

    public static void PutString(string s)
    {
        Storage.Put(Storage.CurrentContext, "String", s);
    }

    public static byte[] GetString()
    {
        return Storage.Get(Storage.CurrentContext, "String");
    }

    public static void PutMapValue(string key, string value)
    {
        StorageMap map = Storage.CurrentContext.CreateMap("ExampleMap");
        map.Put(key, value);
    }

    public static byte[] GetMapValue(string key)
    {
        StorageMap map = Storage.CurrentContext.CreateMap("ExampleMap");
        return map.Get(key);
    }

    public static void PutData(byte[] d)
    {
        Storage.Put(Storage.CurrentContext, "Data", d);
    }

    public static byte[] GetData()
    {
        return Storage.Get(Storage.CurrentContext, "Data");
    }
}


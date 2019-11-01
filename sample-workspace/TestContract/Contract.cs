using System.Numerics;

using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services.Neo;

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

    public static void PutData(byte[] d)
    {
        Storage.Put(Storage.CurrentContext, "Data", d);
    }

    public static byte[] GetData()
    {
        return Storage.Get(Storage.CurrentContext, "Data");
    }
}

